package main

import (
	// "context"
	// "encoding/json"
	"io/ioutil"
	"net/http"
	// "strconv"

	"github.com/tealeg/xlsx"
	"google.golang.org/appengine"
	// "google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
)

type MetaUploadResponse struct {
	RowCount	int			`json:"rows"`
	ColumnCount	int			`json:"cols"`
	Headers		[]string	`json:"headers"`
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

	var response MetaUploadResponse

	var headers []string
	for _, sheet := range xlFile.Sheets {
		log.Debugf(c, "Sheet name: %s", sheet.Name)

		response.RowCount = len(sheet.Rows)
		response.ColumnCount = len(sheet.Cols)
		for j, row := range sheet.Rows {
			log.Debugf(c, "Row: %d", j)
			for k, cell := range row.Cells {
				text := cell.String()

				if j == 0 {
					headers = append(headers, text)
				}
				log.Debugf(c, "Cell: %d %s\n", k, text)
			}
		}
	}

	log.Debugf(c, "%v", headers)
	response.Headers = headers

	w.Write(mustJSON(response))
}
