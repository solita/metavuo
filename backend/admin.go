package main

import (
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
	userKind = "AppUser"
)

type AppUser struct {
	ID           int64  `datastore:"-"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	Organization string `json:"organization"`
	Role         string
	CreatedBy    string
	CreatedByID  string
	Created      time.Time
}

func routeAdmin(w http.ResponseWriter, r *http.Request) {
	var head string
	head, r.URL.Path = shiftPath(r.URL.Path)

	if head == "users" {
		switch r.Method {
		case http.MethodGet:
			routeAdminUsersGet(w, r)
			return
		case http.MethodPost:
			routeAdminUsersCreate(w, r)
			return
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}
	}

	http.Error(w, "", http.StatusMethodNotAllowed)
	return
}

func routeAdminUsersGet(w http.ResponseWriter, r *http.Request) {

}

func routeAdminUsersCreate(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	dec := json.NewDecoder(r.Body)
	var appUser AppUser

	if err := dec.Decode(&appUser); err != nil {
		log.Errorf(c, "Decoding JSON failed while creating user %v", err)
		http.Error(w, "", http.StatusBadRequest)
		return
	}

	appUser.CreatedByID = user.Current(c).ID
	appUser.CreatedBy = user.Current(c).Email
	if user.Current(c).Admin {
		appUser.Role = "admin"
	} else {
		appUser.Role = "user"
	}
	appUser.Created = time.Now().UTC()

	key := datastore.NewIncompleteKey(c, userKind, nil)
	key, err := datastore.Put(c, key, &appUser)

	if err != nil {
		log.Errorf(c, "Adding user failed", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Write(mustJSON(strconv.FormatInt(key.IntID(), 10)))
}
