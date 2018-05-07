package main

import (
	"context"
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"
	"time"

	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
)

const (
	projectKind  = "Project"
	metaDataKind = "SampleMetadata"
	summaryKind  = "SampleSummary"
	listPageSize = 20
)

type ProjectStatus int

const (
	Unknown ProjectStatus = iota
	InProgress
	Complete
	Archived
)

type Project struct {
	ID          int64         `datastore:"-"`
	Name        string        `json:"project_name"`
	ProjectID   string        `json:"project_id"`
	Description string        `json:"project_description"`
	CreatedBy   string        `json:"createdby_email"`
	Status      ProjectStatus `json:"project_status"`
	CreatedByID string
	Created     time.Time
}

type ProjectDetailsDTO struct {
	ID            int64
	Name          string        `json:"project_name"`
	ProjectID     string        `json:"project_id"`
	Description   string        `json:"project_description"`
	CreatedBy     string        `json:"createdby_email"`
	Status        ProjectStatus `json:"project_status"`
	Created       time.Time
	SampleSummary *MetadataSummary `json:"sample_summary"`
}

type ProjectList struct {
	Projects  []Project `json:"projects"`
	NextBatch string    `json:"next"`
}

type Status struct {
	ID   int    `json:",string"`
	Text string `json:"text"`
}

func routeProjects(w http.ResponseWriter, r *http.Request) {
	var head string
	head, r.URL.Path = shiftPath(r.URL.Path)

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
		routeProjectMetadata(w, r)
		return
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

	projectId, err := strconv.ParseInt(r.FormValue("id"), 10, 64)
	if err != nil {
		log.Errorf(c, "Parsing project id failed", err)
		http.Error(w, "", http.StatusBadRequest)
	}

	key := datastore.NewKey(c, projectKind, "", projectId, nil)

	var p Project
	err = datastore.Get(c, key, &p)
	if err != nil {
		if err == datastore.ErrNoSuchEntity {
			log.Errorf(c, "Entity not found", err)
			http.Error(w, "", http.StatusNotFound)
			return
		}
		log.Errorf(c, "Error while getting entity", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if p.Status == Archived {
		http.Error(w, "Project is archived, status can't be changed", http.StatusBadRequest)
		return
	}

	p.Status = p.Status + 1

	datastore.Put(c, key, &p)

	w.Write(mustJSON(p.Status))
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

	isValid, errorMsg := validateName(c, &project)
	if !isValid {
		http.Error(w, errorMsg, http.StatusBadRequest)
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
	project.ProjectID = createProjectId(c)
	project.CreatedByID = user.Current(c).ID
	project.CreatedBy = user.Current(c).Email
	project.Created = time.Now().UTC()
	project.Status = InProgress
	return datastore.Put(c, key, &project)
}

func createProjectId(c context.Context) string {
	currentBOY := time.Date(time.Now().UTC().Year(), 01, 01, 00, 00, 00, 000, time.UTC)
	q := datastore.NewQuery(projectKind).KeysOnly().Filter("Created >=", currentBOY)
	count, err := q.Count(c)
	if err != nil {
		log.Errorf(c, "Creating project id failed", err)
	}
	var letter = string('A' + (time.Now().UTC().Year() - 2018))
	var number = count + 1
	return letter + strconv.Itoa(number)
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

	var summaryArray []MetadataSummary
	q := datastore.NewQuery(summaryKind).Filter("ProjectID = ", id).Limit(1)
	_, err = q.GetAll(c, &summaryArray)

	var summary *MetadataSummary

	if err != nil {
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if len(summaryArray) > 0 {
		summary = &summaryArray[0]
	}

	details := ProjectDetailsDTO{
		ProjectID:     p.ProjectID,
		ID:            id,
		Name:          p.Name,
		Description:   p.Description,
		CreatedBy:     p.CreatedBy,
		Status:        p.Status,
		Created:       p.Created,
		SampleSummary: summary,
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(details))
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
			log.Errorf(c, "Could not decode cursor '%v': '%v'", cursorStr, err)
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
