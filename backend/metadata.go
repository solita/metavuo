package main

import (
	"io/ioutil"
	"net/http"
	"context"
	"strconv"
	"strings"

	"github.com/tealeg/xlsx"
	"google.golang.org/appengine"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/datastore"
	"time"
	"google.golang.org/appengine/user"
)

var validHeaders = []string{"sample_id", "group", "sample_type", "sample_source"}

type validationErrors struct {
	Error  string `json:"error"`
	Detail string `json:"detail"`
}

type sampleMetaData struct {
	SampleID     string
	Group        string
	SampleType   string
	SampleSource string
	CustomField  []string
}

type MetadataSummary struct {
	ProjectID    int64     `json:"-"`
	Headers      []string  `json:"headers"`
	RowCount     int64     `json:"rowcount"`
	UploadedAt   time.Time `json:"uploadedat"`
	UploadedBy   string    `json:"uploadedby"`
	UploadedByID string    `json:"-"`
}

func routeProjectMetadataUpload(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	id, err := strconv.ParseInt(r.FormValue("projectId"), 10, 64)

	if err != nil {
		log.Debugf(c, "Parsing project id failed", err)
		http.Error(w, "", http.StatusBadRequest)
	}

	r.ParseMultipartForm(64 << 20)
	file, header, err := r.FormFile("file")
	description := r.FormValue("description")

	if err != nil {
		log.Debugf(c, "Error getting file: %s", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	bytes, err := ioutil.ReadAll(file)

	if err != nil {
		log.Debugf(c, "Error reading file: %s", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	log.Debugf(c, "File name: %s, description: %s", header.Filename, description)

	xlFile, err := xlsx.OpenBinary(bytes)
	if err != nil {
		log.Debugf(c, "Error opening xlsx-file %s", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	var errList []validationErrors

	if len(xlFile.Sheets) > 1 {
		var valError = validationErrors{
			Error:  "The file can only contain one sheet",
			Detail: "",
		}
		errList = append(errList, valError)
	}

	if len(xlFile.Sheets[0].Rows) == 1 {
		var valError = validationErrors{
			Error:  "The file contained no data rows",
			Detail: "",
		}
		errList = append(errList, valError)
	}

	var headers []string
	var metadata []sampleMetaData
	var sheet = xlFile.Sheets[0]

	for _, cell := range sheet.Rows[0].Cells {
		text := cell.String()

		headers = append(headers, text)
	}
	validateHeaders(headers[:4], &errList)

	for j, row := range sheet.Rows[1:] {
		var metadataCell sampleMetaData

		for k, cell := range row.Cells {
			text := cell.String()

			if isMandatoryColumn(k) {
				setCellValue(k, &metadataCell, &text)
			} else {
				metadataCell.CustomField = append(metadataCell.CustomField, text)
			}
			if isMandatoryDataMissing(j, k, text) {
				var valError = validationErrors{
					Error:  "The file has an empty row in a mandatory cell",
					Detail: "Row: " + strconv.Itoa(j+1) + " Cell: " + strconv.Itoa(k+1),
				}
				errList = append(errList, valError)
			}
		}

		metadata = append(metadata, metadataCell)
	}

	if len(errList) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		w.Write(mustJSON(errList))
		return
	}

	log.Debugf(c, "%v", metadata)

	log.Debugf(c, "%v", headers)

	var p Project
	key := datastore.NewKey(c, projectKind, "", id, nil)
	err = datastore.Get(c, key, &p)

	if err != nil {
		if err == datastore.ErrNoSuchEntity {
			http.Error(w, "Project not found", http.StatusNotFound)
			log.Errorf(c, "", err)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Errorf(c, "", err)
		return
	}

	summary, err := saveMetadata(metadata, c, headers, id)

	if err != nil {
		http.Error(w, "Saving metadata failed", http.StatusInternalServerError)
		log.Errorf(c, "Saving metadata failed", err)
	}

	w.Write(mustJSON(summary))
}
func saveMetadata(a []sampleMetaData, c context.Context, headers []string, id int64) (*MetadataSummary, error) {

	metadataSummary := MetadataSummary{
		ProjectID:    id,
		Headers:      headers,
		RowCount:     int64(len(a)),
		UploadedAt:   time.Now().UTC(),
		UploadedByID: user.Current(c).ID,
		UploadedBy:   user.Current(c).Email,
	}

	summaryKey := datastore.NewIncompleteKey(c, summaryKind, nil)

	err := datastore.RunInTransaction(c, func(ctx context.Context) error {
		summaryKey, err := datastore.Put(c, summaryKey, &metadataSummary)

		if err != nil {
			log.Errorf(c, "Failed to save metadata summary")
			return err
		}

		keys := make([]*datastore.Key, 0, len(a))

		for range a {
			key := datastore.NewIncompleteKey(c, metaDataKind, summaryKey)
			keys = append(keys, key)
		}

		_, err = datastore.PutMulti(ctx, keys, a)

		return err
	}, nil)

	if err != nil {
		return nil, err
	}

	return &metadataSummary, nil
}

func setCellValue(k int, metadataCell *sampleMetaData, text *string) {
	switch k {
	case 0:
		metadataCell.SampleID = *text
	case 1:
		metadataCell.Group = *text
	case 2:
		metadataCell.SampleType = *text
	case 3:
		metadataCell.SampleSource = *text
	}
}

// Skip the header row j and check the first four cells k
func isMandatoryDataMissing(j int, k int, text string) bool {
	return (j > 0 && k < 4) && len(text) < 1
}

func isMandatoryColumn(k int) bool {
	return k < 4
}

func validateHeaders(a []string, errList *[]validationErrors) {

	for i := 0; i < len(a); i++ {
		if len(a) != len(validHeaders) || strings.Compare(a[i], validHeaders[i]) != 0 {
			var valError = validationErrors{
				Error: "The file headers are invalid",
				Detail: "The first four headers are mandatory and must be in the following order: " +
					strings.Join(validHeaders, ","),
			}
			*errList = append(*errList, valError)
			break
		}
	}
}
