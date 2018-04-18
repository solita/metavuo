package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
)

const (
	projectKind  = "Project"
	listPageSize = 20
)

type Project struct {
	ID          int64  `datastore:"-"`
	Name        string `json:"project_name"`
	ProjectID   string `json:"project_id"`
	Description string `json:"project_description"`
	CreatedBy   string `json:"createdby_email"`
	CreatedByID string
	Created     time.Time
}

type ProjectList struct {
	Projects  []string `json:"projects"`
	NextBatch string   `json:"next"`
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

	id, err := strconv.ParseInt(head, 10, 64)
	if err != nil {
		http.Error(w, "", http.StatusNotFound)
		return
	}
	routeProjectsGet(w, r, id)
}

func routeProjectsCreate(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	dec := json.NewDecoder(r.Body)
	var project Project

	if err := dec.Decode(&project); err != nil {
		log.Errorf(c, "Decoding JSON failed", err)
		http.Error(w, "", http.StatusInternalServerError)
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
	return datastore.Put(c, key, &project)
}

func createProjectId() string {
	var idString string = "ABC123"
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
		KeysOnly().
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
		key, err := t.Next(nil)
		if err == datastore.Done {
			break
		}
		if err != nil {
			log.Errorf(c, "Could not fetch next item: %v", err)
			break
		}
		pList.Projects = append(pList.Projects, strconv.FormatInt(key.IntID(), 10))
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
