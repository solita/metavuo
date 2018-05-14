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
	userKind = "AppUser"
)

type AppUser struct {
	ID           int64     `datastore:"-" json:"user_id"`
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
		var head string
		head, r.URL.Path = shiftPath(r.URL.Path)

		if head == "" {
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

		// /api/admin/users/123
		id, err := strconv.ParseInt(head, 10, 64)
		if err != nil {
			http.Error(w, "", http.StatusNotFound)
			return
		}

		head, r.URL.Path = shiftPath(r.URL.Path)

		if head == "" {
			switch r.Method {
			case http.MethodDelete:
				routeAdminUsersDelete(w, r, id)
				return
			default:
				http.Error(w, "", http.StatusMethodNotAllowed)
				return
			}
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
		key, err := t.Next(&u)
		if err == datastore.Done {
			break
		}
		if err != nil {
			log.Errorf(c, "Could not fetch next user: %v", err)
			break
		}

		u.ID = key.IntID()
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

	isValid, errorMsg := validateEmailAddress(appUser.Email)
	if !isValid {
		log.Errorf(c, errorMsg)
		http.Error(w, errorMsg, http.StatusBadRequest)
		return
	}
	isValid, errorMsg = validateEmailUniqueness(c, appUser.Email)
	if !isValid {
		log.Errorf(c, errorMsg)
		http.Error(w, errorMsg, http.StatusBadRequest)
		return
	}

	if appUser.Name == "" || appUser.Organization == "" {
		http.Error(w, "", http.StatusBadRequest)
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

func validateEmailAddress(email string) (bool, string) {
	emailRegex, err := regexp.Compile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	if err != nil {
		return false, "Email address is not valid"
	}

	if emailRegex.MatchString(email) == true {
		return true, ""
	} else {
		return false, "Email address is not valid"
	}
}

func validateEmailUniqueness(c context.Context, email string) (bool, string) {
	q := datastore.NewQuery(userKind).KeysOnly().Filter("Email = ", email).Limit(1)
	t := q.Run(c)
	key, _ := t.Next(nil)

	if key != nil {
		return false, "User with email already exists"
	}
	return true, ""
}

func routeAdminUsersDelete(w http.ResponseWriter, r *http.Request, userId int64) {
	c := appengine.NewContext(r)

	key := datastore.NewKey(c, userKind, "", userId, nil)
	err := datastore.Delete(c, key)

	if err != nil {
		log.Errorf(c, "Error while removing user: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent) // 204
}
