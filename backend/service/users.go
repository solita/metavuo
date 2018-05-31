package service

import (
	"net/http"

	"github.com/solita/metavuo/backend/users"
	"google.golang.org/appengine"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
)

type CurrentUser struct {
	Email     string   `json:"email"`
	Roles     []string `json:"roles"`
	LogoutUrl string   `json:"logout_url"`
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
		c := appengine.NewContext(r)
		_, err := users.GetIDByEmail(c, user.Current(c).Email)
		if err != nil {
			log.Errorf(c, "Failed to get userid: %v", err)
			switch err {
			case users.ErrNoSuchUser:
				http.Error(w, "", http.StatusForbidden)
			default:
				http.Error(w, "", http.StatusInternalServerError)
			}
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

	_, err := users.GetIDByEmail(c, user.Current(c).Email)

	if err == nil {
		roles = append(roles, "user")
	} else if err != users.ErrNoSuchUser {
		log.Errorf(c, "Failed to get userid: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if len(roles) == 0 {
		http.Error(w, "", http.StatusUnauthorized)
		return
	}

	var currentUser CurrentUser
	currentUser.Email = user.Current(c).Email
	currentUser.Roles = roles
	currentUser.LogoutUrl, err = user.LogoutURL(c, "/")

	if err != nil {
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(currentUser))
}

func routeUsersList(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	uList, err := users.List(c)

	if err != nil {
		log.Errorf(c, "Could not get users: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	var collaborators []CollaboratorUser

	for _, u := range uList {
		collaborators = append(collaborators, CollaboratorUser{
			Name:         u.Name,
			Email:        u.Email,
			Organization: u.Organization,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(collaborators))
}
