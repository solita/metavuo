package main

import (
	"net/http"

	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
)

type CurrentUser struct {
	Name string `json:"name"`
	Role string `json:"role"`
}

func routeUsers(w http.ResponseWriter, r *http.Request) {
	var head string
	head, r.URL.Path = shiftPath(r.URL.Path)

	if head == "me" {
		switch r.Method {
		case http.MethodGet:
			routeUsersGetMe(w, r)
			return
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}
	}

	http.Error(w, "", http.StatusMethodNotAllowed)
	return
}

func routeUsersGetMe(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	q := datastore.NewQuery(userKind).Filter("Email = ", user.Current(c).Email).Limit(1).KeysOnly()
	userKeyArray, err := q.GetAll(c, nil)
	if err != nil {
		log.Errorf(c, "Error while getting user: %v", err)
		// http.Error(w, "", http.StatusInternalServerError)
		http.Error(w, "", http.StatusUnauthorized)
		return
	}
	if len(userKeyArray) <= 0 {
		log.Errorf(c, "Error while getting user key: %v", err)
		// http.Error(w, "", http.StatusInternalServerError)
		http.Error(w, "", http.StatusUnauthorized)
		return
	}

	key := &*userKeyArray[0]
	var au AppUser
	err = datastore.Get(c, key, &au)
	if err != nil {
		if err == datastore.ErrNoSuchEntity {
			log.Errorf(c, "User not found: %v", err)
			http.Error(w, "", http.StatusUnauthorized)
			return
		}
		log.Errorf(c, "Error getting user details: %v", err)
		// http.Error(w, "", http.StatusInternalServerError)
		http.Error(w, "", http.StatusUnauthorized)
		return
	}

	currentUser := CurrentUser{
		Name: au.Name,
		Role: au.Role,
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(currentUser))
}
