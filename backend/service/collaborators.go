package service

import (
	"encoding/json"
	"net/http"

	"github.com/solita/metavuo/backend/users"
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

	userId, err := users.GetIDByEmail(c, email)
	if err != nil {
		log.Errorf(c, "Failed to get userid: %v", err)
		switch err {
		case users.ErrNoSuchUser:
			http.Error(w, "", http.StatusBadRequest)
		default:
			http.Error(w, "", http.StatusInternalServerError)
		}
		return
	}

	if !isCollaboratorUnique(&p, userId) {
		http.Error(w, "Collaborator is already in project", http.StatusBadRequest)
		return
	}

	p.Collaborators = append(p.Collaborators, userId)

	_, err = datastore.Put(c, key, &p)

	if err != nil {
		log.Errorf(c, "Adding collaborator to project failed: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
}

func isCollaboratorUnique(p *Project, userId int64) bool {
	for _, cID := range p.Collaborators {
		if cID == userId {
			return false
		}
	}
	return true
}

func routeProjectCollaboratorsList(w http.ResponseWriter, r *http.Request, p Project) {
	c := appengine.NewContext(r)

	collabs, err := users.GetMulti(c, p.Collaborators)

	if err != nil {
		log.Errorf(c, "Error while getting collaborators: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
	}

	var cuArray []CollaboratorUser
	for _, u := range collabs {
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

	userId, err := users.GetIDByEmail(c, delC.Email)
	if err != nil {
		log.Errorf(c, "Error while getting collaborator to remove: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if userId == p.CreatedByID {
		log.Errorf(c, "Cannot remove project creator")
		http.Error(w, "Cannot remove project creator", http.StatusBadRequest)
		return
	}

	found := false
	for i, v := range p.Collaborators {

		if v == userId {
			p.Collaborators = append(p.Collaborators[:i], p.Collaborators[i+1:]...)
			found = true
			break
		}
	}
	if found == true {
		_, err = datastore.Put(c, key, &p)

		if err != nil {
			log.Errorf(c, "Removing collaborator from project failed: %v", err)
			http.Error(w, "", http.StatusInternalServerError)
			return
		}
	}

}
