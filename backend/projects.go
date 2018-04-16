package main

import (
	"net/http"
	"encoding/json"
	"time"
	"context"

	"google.golang.org/appengine/log"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine"
	"google.golang.org/appengine/user"
)

const projectKind = "Project"

type Project struct {
	ID          int64  `datastore:"-"`
	Name        string `json:"project_name"`
	ProjectID   string `json:"project_id"`
	Description string `json:"project_description"`
	CreatedBy   string `json:"createdby_email"`
	CreatedByID string
	Created     time.Time
	// TODO Add Google user ID
}

func createProject(resp http.ResponseWriter, req *http.Request) {
	ctx := appengine.NewContext(req)
	dec := json.NewDecoder(req.Body)
	var project Project

	if err := dec.Decode(&project); err != nil {
		log.Errorf(ctx, "Decoding JSON failed", err)
		resp.WriteHeader(http.StatusInternalServerError)
		return
	}

	_, err := AddProject(ctx, project)

	if err != nil {
		log.Errorf(ctx, "Adding project failed", err)
		resp.WriteHeader(http.StatusInternalServerError)
		return
	}

	resp.WriteHeader(http.StatusOK)

}
func AddProject(ctx context.Context, project Project) (*datastore.Key, error) {

	key := datastore.NewIncompleteKey(ctx, projectKind, nil)

	project.CreatedByID = user.Current(ctx).ID // Comment this line if testing locally without auth

	project.Created = time.Now().UTC()

	return datastore.Put(ctx, key, &project)

}
