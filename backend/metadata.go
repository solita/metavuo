package main

import (
	"io/ioutil"
	"net/http"

	"github.com/tealeg/xlsx"
	"google.golang.org/appengine"
	"google.golang.org/appengine/log"
	"strings"
	"strconv"
)

type MetaUploadResponse struct {
	RowCount    int      `json:"rows"`
	ColumnCount int      `json:"cols"`
	Headers     []string `json:"headers"`
}

var validHeaders = []string{"sample_id", "group", "sample_type", "sample_source"}

type validationErrors struct {
	Error  string `json:"error"`
	Detail string `json:"detail"`
}

func routeProjectMetadataUpload(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

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

	var response MetaUploadResponse
	var headers []string
	for _, sheet := range xlFile.Sheets {
		response.RowCount = len(sheet.Rows)
		response.ColumnCount = len(sheet.Cols)
		for j, row := range sheet.Rows {
			for k, cell := range row.Cells {
				text := cell.String()

				if isMandatoryDataMissing(j, k, text) {
					var valError = validationErrors{
						Error:  "The file has an empty row in a mandatory cell",
						Detail: "Row: " + strconv.Itoa(j+1) + " Cell: " + strconv.Itoa(k+1),
					}
					errList = append(errList, valError)
				}

				if j == 0 {
					headers = append(headers, text)
				}
			}
		}
	}
	validateHeaders(headers[:4], &errList)

	if len(errList) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		w.Write(mustJSON(errList))
		return
	}

	log.Debugf(c, "%v", headers)

	response.Headers = headers

	w.Write(mustJSON(response))
}

// Skip the header row j and check the first four cells k
func isMandatoryDataMissing(j int, k int, text string) bool {
	return (j > 0 && k < 4) && len(text) < 1
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
