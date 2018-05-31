package service

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/tealeg/xlsx"
	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/taskqueue"
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

func routeProjectMetadata(w http.ResponseWriter, r *http.Request, projectId int64, p Project, userId int64) {
	var head string
	head, r.URL.Path = shiftPath(r.URL.Path)

	if head == "" {
		switch r.Method {
		case http.MethodPost:
			routeProjectMetadataUpload(w, r, projectId, userId)
			return
		case http.MethodDelete:
			routeProjectMetadataDelete(w, r, projectId)
			return
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}
	}

	if head == "download" {
		switch r.Method {
		case http.MethodGet:
			routeProjectMetadataDownload(w, r, projectId, p)
			return
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}
	}

	http.Error(w, "", http.StatusMethodNotAllowed)
	return
}

func routeProjectMetadataUpload(w http.ResponseWriter, r *http.Request, projectId int64, userId int64) {
	c := appengine.NewContext(r)

	err := r.ParseMultipartForm(64 << 20)
	if err != nil {
		log.Errorf(c, "Error parsing form: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	file, _, err := r.FormFile("file")

	if err != nil {
		log.Errorf(c, "Error getting file: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	bytes, err := ioutil.ReadAll(file)
	if err != nil {
		log.Errorf(c, "Error reading file: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	xlFile, err := xlsx.OpenBinary(bytes)
	if err != nil {
		log.Errorf(c, "Error opening xlsx-file %v", err)
		http.Error(w, "File format is not valid.", http.StatusBadRequest)
		return
	}

	var errList []validationErrors

	if len(xlFile.Sheets) > 1 {
		var valError = validationErrors{
			Error:  "The file can only contain one sheet",
			Detail: "",
		}
		log.Errorf(c, "Validation error: %v", valError)
		errList = append(errList, valError)
	}

	if len(xlFile.Sheets[0].Rows) == 1 {
		var valError = validationErrors{
			Error:  "The file contained no data rows",
			Detail: "",
		}
		log.Errorf(c, "Validation error: %v", valError)
		errList = append(errList, valError)
	}

	var headers []string
	var metadata []sampleMetaData
	var sheet = xlFile.Sheets[0]

	for _, cell := range sheet.Rows[0].Cells {
		text := cell.String()

		headers = append(headers, text)
	}
	validateHeaders(c, headers[:4], &errList)

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
				log.Errorf(c, "Validation error: %v", valError)
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

	summary, err := saveMetadata(metadata, c, headers, projectId, userId)

	if err != nil {
		log.Errorf(c, "Saving metadata failed: %v", err)
		http.Error(w, "Saving metadata failed", http.StatusInternalServerError)
		return
	}

	w.Write(mustJSON(summary))
}

func saveMetadata(a []sampleMetaData, c context.Context, headers []string, id int64, userId int64) (*MetadataSummary, error) {

	metadataSummary := MetadataSummary{
		ProjectID:    id,
		Headers:      headers,
		RowCount:     int64(len(a)),
		UploadedAt:   time.Now().UTC(),
		UploadedByID: strconv.FormatInt(userId, 10),
		UploadedBy:   user.Current(c).Email,
	}

	summaryKey := datastore.NewIncompleteKey(c, summaryKind, nil)

	err := datastore.RunInTransaction(c, func(c context.Context) error {
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

		_, err = datastore.PutMulti(c, keys, a)

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

func validateHeaders(c context.Context, a []string, errList *[]validationErrors) {

	for i := 0; i < len(a); i++ {
		if len(a) != len(validHeaders) || strings.Compare(a[i], validHeaders[i]) != 0 {
			var valError = validationErrors{
				Error: "The file headers are invalid",
				Detail: "The first four headers are mandatory and must be in the following order: " +
					strings.Join(validHeaders, ","),
			}
			log.Errorf(c, "Validation error: %v", valError)
			*errList = append(*errList, valError)
			break
		}
	}
}

func routeProjectMetadataDelete(w http.ResponseWriter, r *http.Request, projectId int64) {
	c := appengine.NewContext(r)

	q := datastore.NewQuery(summaryKind).Filter("ProjectID = ", projectId).Limit(1).KeysOnly()
	metaDataKeyArray, err := q.GetAll(c, nil)

	if err != nil {
		log.Errorf(c, "Error while getting project metadata to be removed: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if len(metaDataKeyArray) > 0 {
		metaDataKey := &*metaDataKeyArray[0]
		encodedMetaDataKey := metaDataKey.Encode()

		err = datastore.RunInTransaction(c, func(c context.Context) error {
			// Delete samples
			t := taskqueue.NewPOSTTask("/api/tasks/remove-sample-metadata",
				url.Values{"cursor": {""}, "metadataKey": {encodedMetaDataKey}})
			_, err := taskqueue.Add(c, t, "")
			if err != nil {
				log.Criticalf(c, "Could not add task to queue: %v", err)
				return err
			}

			// Delete metadata summary
			err = datastore.Delete(c, metaDataKey)
			if err != nil {
				log.Errorf(c, "Error while removing metatada summary: %v", err)
				return err
			}
			return nil
		}, nil)

		if err != nil {
			log.Errorf(c, "Transaction error: %v", err)
			http.Error(w, "", http.StatusInternalServerError)
			return
		}
	} else {
		log.Errorf(c, "No metadata found")
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent) // 204
}

func routeProjectMetadataDownload(w http.ResponseWriter, r *http.Request, projectId int64, p Project) {
	c := appengine.NewContext(r)

	var summaryArray []MetadataSummary
	var summaryKeyArray []*datastore.Key
	q := datastore.NewQuery(summaryKind).Filter("ProjectID = ", projectId).Limit(1)
	summaryKeyArray, err := q.GetAll(c, &summaryArray)

	if err != nil {
		log.Errorf(c, "Error while getting metadata summary: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if len(summaryArray) > 0 && len(summaryKeyArray) > 0 {
		var summary *MetadataSummary
		summary = &summaryArray[0]
		metaDataKey := &*summaryKeyArray[0]
		q := datastore.NewQuery(metaDataKind).Ancestor(metaDataKey).Limit(1000)

		var samplerows []sampleMetaData
		t := q.Run(c)
		for {
			var s sampleMetaData
			_, err := t.Next(&s)
			if err == datastore.Done {
				break
			}
			if err != nil {
				log.Errorf(c, "Error while getting sample metadata rows: %v", err)
				break
			}
			samplerows = append(samplerows, s)
		}

		sampleResultCount := len(samplerows)

		if sampleResultCount <= 0 {
			log.Errorf(c, "No sample rows found to be added to file")
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		for {
			if sampleResultCount == 1000 {
				cursor, err := t.Cursor()
				if err != nil {
					log.Errorf(c, "Could not get cursor: %v", err)
					http.Error(w, "", http.StatusInternalServerError)
					return
				}

				q := datastore.NewQuery(metaDataKind).Ancestor(metaDataKey).Limit(1000)
				q = q.Start(cursor)

				sampleResultCount = 0
				t := q.Run(c)
				for {
					var s sampleMetaData
					_, err := t.Next(&s)
					if err == datastore.Done {
						break
					}
					if err != nil {
						log.Errorf(c, "Error while getting more sample metadata rows: %v", err)
						break
					}
					sampleResultCount++
					samplerows = append(samplerows, s)
				}

				if sampleResultCount <= 0 {
					log.Debugf(c, "No more sample rows found to be added to file")
					break
				}
			} else {
				break
			}
		}

		var file *xlsx.File
		var sheet *xlsx.Sheet
		var row *xlsx.Row
		var cell *xlsx.Cell

		file = xlsx.NewFile()
		sheet, err = file.AddSheet("Sheet1")
		if err != nil {
			log.Errorf(c, "Could not add sheet to xlsx: %v", err)
			http.Error(w, "", http.StatusInternalServerError)
			return
		}

		// Write headers to sheet
		row = sheet.AddRow()
		for _, hrow := range summary.Headers {
			cell = row.AddCell()
			cell.Value = hrow
		}

		// Write content cells
		for _, srow := range samplerows {
			row = sheet.AddRow()

			cell = row.AddCell()
			sid, err := strconv.ParseFloat(srow.SampleID, 64)
			if err == nil {
				cell.SetFloat(sid)
			} else {
				cell.Value = srow.SampleID
			}

			cell = row.AddCell()
			sg, err := strconv.ParseFloat(srow.Group, 64)
			if err == nil {
				cell.SetFloat(sg)
			} else {
				cell.Value = srow.Group
			}

			cell = row.AddCell()
			cell.Value = srow.SampleType

			cell = row.AddCell()
			cell.Value = srow.SampleSource

			for _, custom := range srow.CustomField {
				cell = row.AddCell()
				i, err := strconv.ParseFloat(custom, 64)
				if err == nil {
					cell.SetFloat(i)
				} else {
					cell.Value = custom
				}
			}
		}

		headerString := fmt.Sprintf("attachment; filename=metadata-%s.xlsx", p.ProjectID)
		w.Header().Set("Content-Disposition", headerString)
		w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

		err = file.Write(w)
		if err != nil {
			log.Errorf(c, "Error writing file: %v", err)
		}
		return
	} else {
		log.Errorf(c, "No metadata found")
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

}
