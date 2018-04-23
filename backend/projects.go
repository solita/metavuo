package main

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"
	"regexp"

	"github.com/tealeg/xlsx"
	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
)

const (
	projectKind  = "Project"
	listPageSize = 20
)

const (
	statusComplete   = "Complete"
	statusArchived   = "Archived"
	statusInProgress = "In Progress"
)

var validStatus = []string{statusArchived, statusComplete, statusInProgress}

type Project struct {
	ID          int64  `datastore:"-"`
	Name        string `json:"project_name"`
	ProjectID   string `json:"project_id"`
	Description string `json:"project_description"`
	CreatedBy   string `json:"createdby_email"`
	Status      string `json:"project_status"`
	CreatedByID string
	Created     time.Time
}

type ProjectList struct {
	Projects  []Project `json:"projects"`
	NextBatch string    `json:"next"`
}

type StatusUpdateReq struct {
	ID        int64
	NewStatus string
}

func routeProjects(w http.ResponseWriter, r *http.Request) {
	var head string
	head, r.URL.Path = shiftPath(r.URL.Path)

	c := appengine.NewContext(r)
	log.Debugf(c, "%s", string(head))
	if head == "" {
		switch r.Method {
		case http.MethodPost:
			routeProjectsCreate(w, r)
			return
		case http.MethodGet:
			routeProjectsList(w, r)
			return
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}
	}

	if head == "metadata" {
		switch r.Method {
		case http.MethodPost:
			routeProjectMetadataUpload(w, r)
			return
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}
	}

	if head == "status" {
		switch r.Method {
		case http.MethodPost:
			routeProjectStatusUpdate(w, r)
			return
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}
	}

	id, err := strconv.ParseInt(head, 10, 64)
	if err != nil {
		http.Error(w, "", http.StatusNotFound)
		return
	}

	routeProjectsGet(w, r, id)
}

func routeProjectStatusUpdate(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	var p Project
	var statusUpdate StatusUpdateReq

	dec := json.NewDecoder(r.Body)

	if err := dec.Decode(&statusUpdate); err != nil {
		log.Errorf(c, "Decoding JSON failed while updating status", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if !arrayContains(validStatus, statusUpdate.NewStatus) {
		http.Error(w, "", http.StatusBadRequest)
		return
	}

	key := datastore.NewKey(c, projectKind, "", statusUpdate.ID, nil)
	err := datastore.Get(c, key, &p)
	if err != nil {
		if err == datastore.ErrNoSuchEntity {
			http.Error(w, "", http.StatusNotFound)
			return
		}
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	p.Status = statusUpdate.NewStatus
	datastore.Put(c, key, &p)
}

func routeProjectsCreate(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	dec := json.NewDecoder(r.Body)
	var project Project

	if err := dec.Decode(&project); err != nil {
		log.Errorf(c, "Decoding JSON failed while creating project", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	 isValid, error := validateName(c, &project)
	 if !isValid {
		 http.Error(w, error, http.StatusBadRequest)
		 return
	 }

	key, err := addProject(c, project)

	if err != nil {
		log.Errorf(c, "Adding project failed", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Write(mustJSON(strconv.FormatInt(key.IntID(), 10)))
}

func addProject(c context.Context, project Project) (*datastore.Key, error) {
	key := datastore.NewIncompleteKey(c, projectKind, nil)
	project.ProjectID = createProjectId()
	project.CreatedByID = user.Current(c).ID
	project.CreatedBy = user.Current(c).Email
	project.Created = time.Now().UTC()
	project.Status = statusInProgress
	return datastore.Put(c, key, &project)
}

func createProjectId() string {
	var idString = "ABC123"
	return idString
}

func routeProjectsGet(w http.ResponseWriter, r *http.Request, id int64) {
	c := appengine.NewContext(r)

	var p Project
	key := datastore.NewKey(c, projectKind, "", id, nil)
	err := datastore.Get(c, key, &p)
	if err != nil {
		if err == datastore.ErrNoSuchEntity {
			http.Error(w, "", http.StatusNotFound)
			return
		}
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(p))
}

func routeProjectsList(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	q := datastore.NewQuery(projectKind).
		Limit(listPageSize).
		Order("Created")

	cursorStr := r.URL.Query().Get("cursor")
	if cursorStr != "" {
		cursor, err := datastore.DecodeCursor(cursorStr)
		if err != nil {
			log.Infof(c, "Could not decode cursor '%v': '%v'", cursorStr, err)
			http.Error(w, "", http.StatusBadRequest)
			return
		}
		q = q.Start(cursor)
	}

	var pList ProjectList
	t := q.Run(c)

	for {
		var p Project
		key, err := t.Next(&p)
		if err == datastore.Done {
			break
		}
		if err != nil {
			log.Errorf(c, "Could not fetch next item: %v", err)
			break
		}

		p.ID = key.IntID()

		pList.Projects = append(pList.Projects, p)
	}

	if len(pList.Projects) == listPageSize {
		cursor, err := t.Cursor()
		if err != nil {
			http.Error(w, "", http.StatusInternalServerError)
			return
		}
		if cursor.String() != "" {
			pList.NextBatch = "/api/projects/?cursor=" + cursor.String()
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(pList))
}

func routeProjectMetadataUpload(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	r.ParseMultipartForm(64 << 20)
	file, header, _ := r.FormFile("file")
	description := r.FormValue("description")

	bytes, _ := ioutil.ReadAll(file)

	log.Debugf(c, "%s %s", description, header.Filename)

	xlFile, err := xlsx.OpenBinary(bytes)
	if err != nil {
		log.Debugf(c, "Error opening file %s", err)
	}
	for _, sheet := range xlFile.Sheets {
		log.Debugf(c, sheet.Name)
		for _, row := range sheet.Rows {
			for _, cell := range row.Cells {
				text := cell.String()
				log.Debugf(c, "%s\n", text)
			}
		}
	}
}

func validateName(c context.Context, project *Project) (bool, string) {

	match, _ := regexp.MatchString("^[\\w_-]*$", project.Name)

	if !match {
		return false, "Project name is invalid"
	}

	q := datastore.NewQuery(projectKind).KeysOnly().Filter("Name = ", project.Name).Limit(1)
	t := q.Run(c)
	key, _ := t.Next(nil)

	if key != nil {
		return false, "Project name is not unique"
	}
	return true, ""
}
