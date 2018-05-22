package main

import (
	"net/http"

	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
)

type CurrentUser struct {
	Email string   `json:"email"`
	Roles []string `json:"roles"`
}

type CollaboratorUser struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	Organization string `json:"organization"`
}

func routeUsers(w http.ResponseWriter, r *http.Request) {
	var head string
	head, r.URL.Path = shiftPath(r.URL.Path)

	if head == "" {
		userId := getAppUserId(w, r)
		if userId == 0 {
			http.Error(w, "", http.StatusForbidden)
			return
		}

		switch r.Method {
		case http.MethodGet:
			routeUsersList(w, r)
			return
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}
	}

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

	var roles []string

	if user.IsAdmin(c) {
		roles = append(roles, "admin")
	}

	q := datastore.NewQuery(userKind).Filter("Email = ", user.Current(c).Email).Limit(1)

	var uList []AppUser
	_, err := q.GetAll(c, &uList)
	if err != nil {
		log.Errorf(c, "Error while getting user: %v", err)
	} else {
		if len(uList) > 0 {
			roles = append(roles, "user")
		}
	}

	if len(roles) == 0 {
		http.Error(w, "", http.StatusUnauthorized)
		return
	}

	var currentUser CurrentUser
	currentUser.Email = user.Current(c).Email
	currentUser.Roles = roles

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(currentUser))
}

func routeUsersList(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	q := datastore.NewQuery(userKind).Limit(500).Order("Name")

	var uList []CollaboratorUser

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

		var cu CollaboratorUser
		cu.Name = u.Name
		cu.Email = u.Email
		cu.Organization = u.Organization

		uList = append(uList, cu)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(uList))
}
