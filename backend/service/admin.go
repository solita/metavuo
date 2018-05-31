package service

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"

	"github.com/solita/metavuo/backend/users"
	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/taskqueue"
)

const (
	infoKind = "InfoText"
)

type InfoText struct {
	Title   string `json:"title"`
	Content string `datastore:",noindex" json:"content"`
}

func routeAdmin(w http.ResponseWriter, r *http.Request) {
	var head string
	head, r.URL.Path = shiftPath(r.URL.Path)

	if head == "info" {
		switch r.Method {
		case http.MethodPost:
			routeInfoCreate(w, r)
		case http.MethodPut:
			routeInfoUpdate(w, r)
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
		}
		return
	}

	if head == "users" {
		routeAdminUsers(w, r)
		return
	}

	if head == "project" {
		head, r.URL.Path = shiftPath(r.URL.Path)
		id, err := strconv.ParseInt(head, 10, 64)
		if err != nil {
			http.Error(w, "", http.StatusNotFound)
			return
		}
		switch r.Method {
		case http.MethodDelete:
			routeAdminProjectDelete(w, r, id)
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
		}
		return
	}

	http.Error(w, "", http.StatusMethodNotAllowed)
}

func routeAdminUsers(w http.ResponseWriter, r *http.Request) {
	var head string
	head, r.URL.Path = shiftPath(r.URL.Path)

	if head == "" {
		switch r.Method {
		case http.MethodGet:
			routeAdminUsersGet(w, r)
		case http.MethodPost:
			routeAdminUsersCreate(w, r)
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
		}
		return
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
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
		}
		return
	}
}

func routeAdminUsersGet(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	uList, err := users.List(c)
	if err != nil {
		log.Errorf(c, "Could not get users: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(uList))
}

func routeAdminUsersCreate(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	var appUser users.AppUser
	err := json.NewDecoder(r.Body).Decode(&appUser)
	if err != nil {
		log.Errorf(c, "Decoding JSON failed while creating user %v", err)
		http.Error(w, "", http.StatusBadRequest)
		return
	}
	_, err = users.Create(c, appUser.Name, appUser.Email, appUser.Organization)
	if err != nil {
		log.Errorf(c, "Could not create user %v", err)
		switch err {
		case users.ErrEmailNotUnique:
			http.Error(w, "User already exists", http.StatusBadRequest)
		case users.ErrEmailInvalid:
			http.Error(w, "Invalid email", http.StatusBadRequest)
		case users.ErrNameEmpty:
			http.Error(w, "Name missing", http.StatusBadRequest)
		case users.ErrOrgEmpty:
			http.Error(w, "Organization missing", http.StatusBadRequest)
		default:
			http.Error(w, "", http.StatusInternalServerError)
		}
		return
	}

}

func routeAdminUsersDelete(w http.ResponseWriter, r *http.Request, userId int64) {
	c := appengine.NewContext(r)

	// remove user from project collaborators
	q := datastore.NewQuery(projectKind).Filter("Collaborators = ", userId).Limit(1000)
	var projects []Project
	pKeys, err := q.GetAll(c, &projects)
	if err != nil {
		log.Errorf(c, "Getting user¨s projects failed: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	for i, p := range projects {
		found := false
		for j, v := range p.Collaborators {
			if v == userId {
				p.Collaborators = append(p.Collaborators[:j], p.Collaborators[j+1:]...)
				found = true
				break
			}
		}
		if found == true {
			_, err = datastore.Put(c, pKeys[i], &p)
			if err != nil {
				log.Errorf(c, "Removing collaborator from project failed: %v", err)
				http.Error(w, "", http.StatusInternalServerError)
				return
			}
		}
	}

	// remove user
	err = users.Delete(c, userId)
	if err != nil {
		log.Errorf(c, "Error while removing user: %v", err)
		switch err {
		case users.ErrNoSuchUser:
			http.Error(w, "", http.StatusBadRequest)
		default:
			http.Error(w, "", http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent) // 204
}

func routeInfoCreate(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	var infoArray []InfoText
	q := datastore.NewQuery(infoKind).Limit(1)
	_, err := q.GetAll(c, &infoArray)
	if err != nil {
		log.Errorf(c, "Error while getting info text: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	if len(infoArray) > 0 {
		log.Errorf(c, "Info text already exists")
		http.Error(w, "Info text already exists", http.StatusBadRequest)
		return
	}

	dec := json.NewDecoder(r.Body)
	var i InfoText
	if err := dec.Decode(&i); err != nil {
		log.Errorf(c, "Decoding JSON failed while creating info text %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	key := datastore.NewIncompleteKey(c, infoKind, nil)
	_, err = datastore.Put(c, key, &i)
	if err != nil {
		log.Errorf(c, "Adding info text failed: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(i))
}

func routeInfoUpdate(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	dec := json.NewDecoder(r.Body)
	var i InfoText
	if err := dec.Decode(&i); err != nil {
		log.Errorf(c, "Decoding JSON failed while updating info text %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	var infoArray []InfoText
	var infoKeyArray []*datastore.Key
	q := datastore.NewQuery(infoKind).Limit(1)
	infoKeyArray, err := q.GetAll(c, &infoArray)

	if err != nil {
		log.Errorf(c, "Error while getting info text: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if len(infoArray) <= 0 {
		log.Errorf(c, "Updating info text failed, none exist")
		http.Error(w, "Updating info text failed, none exist", http.StatusBadRequest)
		return
	}

	key := infoKeyArray[0]
	currInfo := infoArray[0]
	currInfo.Title = i.Title
	currInfo.Content = i.Content

	_, err = datastore.Put(c, key, &currInfo)
	if err != nil {
		log.Errorf(c, "Updating info text failed: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(currInfo))
}

func routeAdminProjectDelete(w http.ResponseWriter, r *http.Request, id int64) {
	c := appengine.NewContext(r)
	var p Project
	projectKey := datastore.NewKey(c, projectKind, "", id, nil)
	err := datastore.Get(c, projectKey, &p)

	if err != nil {
		log.Errorf(c, "Getting project for deletion failed: %v", err)
		return
	}
	var summaryArray []MetadataSummary
	var summaryKeyArray []*datastore.Key
	q := datastore.NewQuery(summaryKind).Filter("ProjectID = ", id).Limit(1)
	summaryKeyArray, err = q.GetAll(c, &summaryArray)

	if err != nil {
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	err = datastore.RunInTransaction(c, func(c context.Context) error {
		if len(summaryKeyArray) > 0 {
			metaDataKey := &*summaryKeyArray[0]
			encodedMetaDataKey := metaDataKey.Encode()
			// Delete samples
			t := taskqueue.NewPOSTTask("/api/tasks/remove-sample-metadata",
				url.Values{"cursor": {""}, "metadataKey": {encodedMetaDataKey}})
			_, err := taskqueue.Add(c, t, "")
			if err != nil {
				log.Criticalf(c, "Could not add task to queue: %v", err)
				return err
			}
			// Delete metadata summary
			err = datastore.Delete(c, metaDataKey)
			if err != nil {
				log.Errorf(c, "Error while removing metatada summary: %v", err)
				return err
			}
		}

		// Delete project
		err = datastore.Delete(c, projectKey)
		if err != nil {
			log.Errorf(c, "Error while removing project: %v", err)
			return err
		}

		// Delete storage-files
		t := taskqueue.NewPOSTTask("/api/tasks/remove-storage-files",
			url.Values{"id": {strconv.Itoa(int(id))}})
		_, err := taskqueue.Add(c, t, "")

		if err != nil {
			log.Errorf(c, "Could not add task to queue: %v", err)
			return err
		}

		return nil
	}, &datastore.TransactionOptions{XG: true})

	if err != nil {
		log.Errorf(c, "Transaction error: %v", err)
		http.Error(w, "Deleting project failed, please try again", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent) // 204
}
