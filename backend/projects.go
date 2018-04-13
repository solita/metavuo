package main

import (
	"net/http"
	"encoding/json"
	"google.golang.org/appengine/log"
	"context"
	"google.golang.org/appengine/datastore"
	"time"
	"google.golang.org/appengine"
)

var kind = "Project"

type Project struct {
	ID        int64     `datastore:"-"`
	Name      string    `json:"project_name"`
	ProjectID string    `json:"project_id"`
	CreatedBy string    `json:"createdby_email"`
	Created   time.Time `datastore:"created"`
	// TODO Add Google user ID
}

func createProject(resp http.ResponseWriter, req *http.Request) {
	ctx := appengine.NewContext(req) // Is this ok or should context be passed as a param?
	dec := json.NewDecoder(req.Body)
	var project Project

	if err := dec.Decode(&project); err != nil {
		log.Errorf(ctx, "Decoding JSON failed", err)
		resp.WriteHeader(http.StatusInternalServerError)
		return
	}

	key, err := AddProject(ctx, project)

	if err != nil {
		log.Errorf(ctx, "Adding project failed", err)
		resp.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Infof(ctx, "Added project with key: "+key.String()) // Do we have an actual use for the key?

	resp.WriteHeader(http.StatusOK)

}
func AddProject(ctx context.Context, project Project) (*datastore.Key, error) {

	key := datastore.NewIncompleteKey(ctx, kind, nil)

	project.Created = time.Now()

	return datastore.Put(ctx, key, &project)

}
