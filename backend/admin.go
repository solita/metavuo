package main

import (
	"context"
	"encoding/json"
	"net/http"
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
	ID           int64     `datastore:"-" json:"-"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Organization string    `json:"organization"`
	CreatedBy    string    `json:"-"`
	CreatedByID  string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
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
	c := appengine.NewContext(r)

	q := datastore.NewQuery(userKind).Limit(500).Order("Name")

	var uList []AppUser
	t := q.Run(c)
	for {
		var u AppUser
		_, err := t.Next(&u)
		if err == datastore.Done {
			break
		}
		if err != nil {
			log.Errorf(c, "Could not fetch next user: %v", err)
			break
		}

		uList = append(uList, u)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(uList))
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

	isValid, errorMsg := validateEmailUniqueness(c, appUser.Email)
	if !isValid {
		log.Errorf(c, errorMsg)
		http.Error(w, errorMsg, http.StatusBadRequest)
		return
	}

	appUser.CreatedByID = user.Current(c).ID
	appUser.CreatedBy = user.Current(c).Email
	appUser.CreatedAt = time.Now().UTC()

	key := datastore.NewIncompleteKey(c, userKind, nil)
	key, err := datastore.Put(c, key, &appUser)

	if err != nil {
		log.Errorf(c, "Adding user failed", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
}

func validateEmailUniqueness(c context.Context, email string) (bool, string) {
	q := datastore.NewQuery(userKind).KeysOnly().Filter("Email = ", email).Limit(1)
	t := q.Run(c)
	key, _ := t.Next(nil)

	if key != nil {
		return false, "User email name is not unique"
	}
	return true, ""
}
