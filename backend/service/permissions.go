package service

import (
	"net/http"

	"google.golang.org/appengine"
	"google.golang.org/appengine/user"
)

func isUserCollaborator(r *http.Request, userId int64, p Project) bool {
	c := appengine.NewContext(r)

	if user.IsAdmin(c) {
		return true
	}

	for _, cId := range p.Collaborators {
		if cId == userId {
			return true
		}
	}
	return false
}
