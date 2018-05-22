package main

import (
	"net/http"

	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
)

func getAppUserId(w http.ResponseWriter, r *http.Request) int64 {
	c := appengine.NewContext(r)

	q := datastore.NewQuery(userKind).Filter("Email = ", user.Current(c).Email).Limit(1).KeysOnly()

	cuKeyArray, err := q.GetAll(c, nil)
	if err != nil {
		log.Errorf(c, "Error while getting user: %v", err)
		return 0
	}

	if len(cuKeyArray) <= 0 {
		log.Errorf(c, "User not found")
		return 0
	}

	return cuKeyArray[0].IntID()
}

func isUserCollaborator(w http.ResponseWriter, r *http.Request, userId int64, p Project) bool {
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
