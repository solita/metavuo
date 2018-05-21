package main

import (
	"net/http"

	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
)

func routeInfo(w http.ResponseWriter, r *http.Request) {
	userId := getAppUserId(w, r)
	if userId == 0 {
		http.Error(w, "", http.StatusForbidden)
		return
	}

	switch r.Method {
	case http.MethodGet:
		routeInfoGet(w, r)
		return
	default:
		http.Error(w, "", http.StatusMethodNotAllowed)
		return
	}
}

func routeInfoGet(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	var infoArray []InfoText
	q := datastore.NewQuery(infoKind).Limit(1)
	_, err := q.GetAll(c, &infoArray)

	if err != nil {
		log.Errorf(c, "Error while getting info text: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if len(infoArray) <= 0 {
		log.Errorf(c, "No info text found: %v", err)
		http.Error(w, "", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(&infoArray[0]))
}
