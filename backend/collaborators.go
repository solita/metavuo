package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
)

func routeProjectCollaborators(w http.ResponseWriter, r *http.Request, p Project, key *datastore.Key) {
	switch r.Method {
	case http.MethodPost:
		routeProjectCollaboratorsAdd(w, r, p, key)
		return
	case http.MethodGet:
		routeProjectCollaboratorsList(w, r, p)
		return
	case http.MethodPut:
		routeProjectCollaboratorsDelete(w, r, p, key)
		return
	default:
		http.Error(w, "", http.StatusMethodNotAllowed)
		return
	}
}

func routeProjectCollaboratorsAdd(w http.ResponseWriter, r *http.Request, p Project, key *datastore.Key) {
	c := appengine.NewContext(r)

	email := r.FormValue("email")
	if email == "" {
		log.Errorf(c, "No email given")
		http.Error(w, "", http.StatusBadRequest)
	}

	q := datastore.NewQuery(userKind).Filter("Email = ", email).Limit(1).KeysOnly()
	cuKeyArray, err := q.GetAll(c, nil)
	if err != nil {
		log.Errorf(c, "Error while getting collaborator to add: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if len(cuKeyArray) <= 0 {
		log.Errorf(c, "No collaborators found to add")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	uKey := cuKeyArray[0]

	isValid, errorMsg := validateCollaboratorUniqueness(c, &p, uKey.IntID())
	if !isValid {
		http.Error(w, errorMsg, http.StatusBadRequest)
		return
	}

	p.Collaborators = append(p.Collaborators, uKey.IntID())

	_, err = datastore.Put(c, key, &p)

	if err != nil {
		log.Errorf(c, "Adding collaborator to project failed", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
}

func validateCollaboratorUniqueness(c context.Context, p *Project, userId int64) (bool, string) {
	for _, cId := range p.Collaborators {
		if cId == userId {
			return false, "Collaborator is already in project"
		}
	}
	return true, ""
}

func routeProjectCollaboratorsList(w http.ResponseWriter, r *http.Request, p Project) {
	c := appengine.NewContext(r)

	if len(p.Collaborators) <= 0 {
		log.Debugf(c, "No collaborators found")
		w.WriteHeader(http.StatusNoContent) // 204
		return
	}

	var keys []*datastore.Key
	for _, collab := range p.Collaborators {
		key := datastore.NewKey(c, userKind, "", collab, nil)
		keys = append(keys, key)
	}

	var uArray = make([]AppUser, len(keys))
	err := datastore.GetMulti(c, keys, uArray)
	if err != nil {
		log.Errorf(c, "Error while getting collaborators: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	var cuArray []CollaboratorUser
	for _, u := range uArray {
		var cu CollaboratorUser
		cu.Name = u.Name
		cu.Email = u.Email
		cu.Organization = u.Organization
		cuArray = append(cuArray, cu)
	}

	w.Write(mustJSON(cuArray))
}

func routeProjectCollaboratorsDelete(w http.ResponseWriter, r *http.Request, p Project, key *datastore.Key) {
	c := appengine.NewContext(r)

	dec := json.NewDecoder(r.Body)
	var delC DelCollaborator
	if err := dec.Decode(&delC); err != nil {
		log.Errorf(c, "Decoding JSON failed while deleting collaborator %v", err)
		http.Error(w, "", http.StatusBadRequest)
		return
	}

	if delC.Email == "" {
		log.Errorf(c, "No email given")
		http.Error(w, "", http.StatusBadRequest)
		return
	}

	q := datastore.NewQuery(userKind).Filter("Email = ", delC.Email).Limit(1).KeysOnly()
	cuKeyArray, err := q.GetAll(c, nil)
	if err != nil {
		log.Errorf(c, "Error while getting collaborator to remove: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if len(cuKeyArray) <= 0 {
		log.Errorf(c, "No collaborators found to remove")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if strconv.FormatInt(cuKeyArray[0].IntID(), 10) == p.CreatedByID {
		log.Errorf(c, "Cannot remove project creator")
		http.Error(w, "Cannot remove project creator", http.StatusBadRequest)
		return
	}

	for i, v := range p.Collaborators {
		if v == cuKeyArray[0].IntID() {
			p.Collaborators = append(p.Collaborators[:i], p.Collaborators[i+1:]...)
			break
		}
	}

	_, err = datastore.Put(c, key, &p)

	if err != nil {
		log.Errorf(c, "Removing collaborator from project failed", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

}
