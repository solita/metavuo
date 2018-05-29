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
	projectKind  = "Project"
	metaDataKind = "SampleMetadata"
	summaryKind  = "SampleSummary"
	listPageSize = 20
)

type ProjectStatus int

const (
	Unknown    ProjectStatus = iota
	InProgress
	Complete
	Archived
)

type Project struct {
	ID                int64         `datastore:"-"`
	Name              string        `json:"project_name"`
	ProjectID         string        `json:"project_id"`
	Description       string        `json:"project_description"`
	CreatedBy         string        `json:"createdby_email"`
	Status            ProjectStatus `json:"project_status"`
	CustomerOrg       string        `json:"customer_organization"`
	InvoiceAddr       string        `json:"customer_invoice_address"`
	CustomerName      string        `json:"customer_name"`
	CustomerEmail     string        `json:"customer_email"`
	CustomerPhone     string        `json:"customer_phone"`
	CustomerReference string        `json:"customer_reference"`
	InternalReference string        `json:"customer_internal_reference"`
	SampleLocation    string        `json:"sample_location"`
	AdditionalInfo    string        `json:"additional_information"`
	Collaborators     []int64       `json:"-"`
	CreatedByID       string
	Created           time.Time
}

type ProjectDetailsDTO struct {
	ID                int64
	Name              string           `json:"project_name"`
	ProjectID         string           `json:"project_id"`
	Description       string           `json:"project_description"`
	CreatedBy         string           `json:"createdby_email"`
	Status            ProjectStatus    `json:"project_status"`
	CustomerOrg       string           `json:"customer_organization"`
	InvoiceAddr       string           `json:"customer_invoice_address"`
	CustomerName      string           `json:"customer_name"`
	CustomerEmail     string           `json:"customer_email"`
	CustomerPhone     string           `json:"customer_phone"`
	CustomerReference string           `json:"customer_reference"`
	InternalReference string           `json:"customer_internal_reference"`
	SampleLocation    string           `json:"sample_location"`
	AdditionalInfo    string           `json:"additional_information"`
	Collaborators     []int64          `json:"collaborators"`
	Created           time.Time
	SampleSummary     *MetadataSummary `json:"sample_summary"`
}

type ProjectUpdateRequest struct {
	Name              string `json:"project_name"`
	Description       string `json:"project_description"`
	CustomerOrg       string `json:"customer_organization"`
	InvoiceAddr       string `json:"customer_invoice_address"`
	CustomerName      string `json:"customer_name"`
	CustomerEmail     string `json:"customer_email"`
	CustomerPhone     string `json:"customer_phone"`
	CustomerReference string `json:"customer_reference"`
	InternalReference string `json:"customer_internal_reference"`
	SampleLocation    string `json:"sample_location"`
	AdditionalInfo    string `json:"additional_information"`
}

type ProjectList struct {
	Projects  []Project `json:"projects"`
	NextBatch string    `json:"next"`
}

type Status struct {
	ID   int    `json:",string"`
	Text string `json:"text"`
}

type DelCollaborator struct {
	Email string `json:"email"`
}

func routeProjects(w http.ResponseWriter, r *http.Request) {
	userId := getAppUserId(w, r)
	if userId == 0 {
		http.Error(w, "", http.StatusForbidden)
		return
	}

	var head string
	head, r.URL.Path = shiftPath(r.URL.Path)

	if head == "" {
		switch r.Method {
		case http.MethodPost:
			routeProjectsCreate(w, r, userId)
		case http.MethodGet:
			routeProjectsList(w, r, userId)
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
		}
		return
	}

	// /api/projects/123
	id, err := strconv.ParseInt(head, 10, 64)
	if err != nil {
		http.Error(w, "", http.StatusNotFound)
		return
	}

	p, key, err := getProject(w, r, id)
	if err != nil {
		if err == datastore.ErrNoSuchEntity {
			http.Error(w, "", http.StatusNotFound)
			return
		}
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	isCollaborator := isUserCollaborator(w, r, userId, p)
	if isCollaborator == false {
		http.Error(w, "", http.StatusForbidden)
		return
	}

	head, r.URL.Path = shiftPath(r.URL.Path)

	switch head {
	case "":
		switch r.Method {
		case http.MethodGet:
			routeProjectsGet(w, r, p, id)
		case http.MethodPut:
			routeProjectUpdate(w, r, p, key)
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
		}
	case "status":
		switch r.Method {
		case http.MethodPost:
			routeProjectStatusUpdate(w, r, p, key)
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
		}
	case "metadata":
		routeProjectMetadata(w, r, id, p, userId)
	case "files":
		routeProjectFile(w, r, id)
	case "collaborators":
		routeProjectCollaborators(w, r, p, key)
	default:
		http.Error(w, "", http.StatusMethodNotAllowed)
	}
}

func routeProjectsCreate(w http.ResponseWriter, r *http.Request, userId int64) {
	c := appengine.NewContext(r)
	dec := json.NewDecoder(r.Body)
	var project Project

	if err := dec.Decode(&project); err != nil {
		log.Errorf(c, "Decoding JSON failed while creating project: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	isValid, errorMsg := validateName(c, &project)
	if !isValid {
		log.Errorf(c, "Project name is not valid")
		http.Error(w, errorMsg, http.StatusBadRequest)
		return
	}

	key := datastore.NewIncompleteKey(c, projectKind, nil)
	project.ProjectID = createProjectId(c)
	project.Created = time.Now().UTC()
	project.Status = InProgress
	project.CreatedBy = user.Current(c).Email
	project.CreatedByID = strconv.FormatInt(userId, 10)

	var cList []int64
	cList = append(cList, userId)
	project.Collaborators = cList

	key, err := datastore.Put(c, key, &project)

	if err != nil && key != nil {
		log.Errorf(c, "Adding project failed: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Write(mustJSON(strconv.FormatInt(key.IntID(), 10)))
}

func createProjectId(c context.Context) string {
	currentBOY := time.Date(time.Now().UTC().Year(), 01, 01, 00, 00, 00, 000, time.UTC)
	var projectArray []Project
	q := datastore.NewQuery(projectKind).Filter("Created >=", currentBOY).Order("Created")
	_, err := q.GetAll(c, &projectArray)
	if err != nil {
		log.Errorf(c, "Creating project id failed", err)
		return ""
	}
	var letter = string('A' + (time.Now().UTC().Year() - 2018))
	var number = 0
	if len(projectArray) > 0 {
		number, err = strconv.Atoi(projectArray[len(projectArray)-1].ProjectID[1:])
		if err != nil {
			log.Errorf(c, "Creating project id failed", err)
			return ""
		}
	}
	number = number + 1

	return letter + strconv.Itoa(number)
}

func routeProjectsList(w http.ResponseWriter, r *http.Request, userId int64) {
	c := appengine.NewContext(r)

	q := datastore.NewQuery(projectKind).
		Filter("Collaborators = ", userId).
		Limit(listPageSize).
		Order("Created")

	if user.IsAdmin(c) {
		q = datastore.NewQuery(projectKind).
			Limit(listPageSize).
			Order("Created")
	}

	cursorStr := r.URL.Query().Get("cursor")
	if cursorStr != "" {
		cursor, err := datastore.DecodeCursor(cursorStr)
		if err != nil {
			log.Errorf(c, "Could not decode cursor '%v': '%v'", cursorStr, err)
			http.Error(w, "", http.StatusBadRequest)
			return
		}
		q = q.Start(cursor)
	}

	var pList ProjectList
	t := q.Run(c)

	for {
		var p Project
		key, err := t.Next(&p)
		if err == datastore.Done {
			break
		}
		if err != nil {
			log.Errorf(c, "Could not fetch next item: %v", err)
			break
		}

		p.ID = key.IntID()

		pList.Projects = append(pList.Projects, p)
	}

	if len(pList.Projects) == listPageSize {
		cursor, err := t.Cursor()
		if err != nil {
			log.Errorf(c, "Could not get cursor: %v", err)
			http.Error(w, "", http.StatusInternalServerError)
			return
		}
		if cursor.String() != "" {
			pList.NextBatch = "/api/projects/?cursor=" + cursor.String()
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(pList))
}

func getProject(w http.ResponseWriter, r *http.Request, id int64) (Project, *datastore.Key, error) {
	c := appengine.NewContext(r)

	var p Project
	key := datastore.NewKey(c, projectKind, "", id, nil)
	err := datastore.Get(c, key, &p)
	if err != nil {
		return p, key, err
	}

	return p, key, nil

}

func routeProjectsGet(w http.ResponseWriter, r *http.Request, p Project, id int64) {
	c := appengine.NewContext(r)

	var summaryArray []MetadataSummary
	q := datastore.NewQuery(summaryKind).Filter("ProjectID = ", id).Limit(1)
	_, err := q.GetAll(c, &summaryArray)

	var summary *MetadataSummary

	if err != nil {
		log.Errorf(c, "Error getting metadata: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if len(summaryArray) > 0 {
		summary = &summaryArray[0]
	}

	details := ProjectDetailsDTO{
		ProjectID:         p.ProjectID,
		ID:                id,
		Name:              p.Name,
		Description:       p.Description,
		CreatedBy:         p.CreatedBy,
		Status:            p.Status,
		Created:           p.Created,
		SampleSummary:     summary,
		CustomerOrg:       p.CustomerOrg,
		InvoiceAddr:       p.InvoiceAddr,
		CustomerName:      p.CustomerName,
		CustomerEmail:     p.CustomerEmail,
		CustomerPhone:     p.CustomerPhone,
		CustomerReference: p.CustomerReference,
		InternalReference: p.InternalReference,
		SampleLocation:    p.SampleLocation,
		AdditionalInfo:    p.AdditionalInfo,
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(mustJSON(details))
}

func routeProjectUpdate(w http.ResponseWriter, r *http.Request, p Project, key *datastore.Key) {
	c := appengine.NewContext(r)

	dec := json.NewDecoder(r.Body)
	var updateReq ProjectUpdateRequest

	if err := dec.Decode(&updateReq); err != nil {
		log.Errorf(c, "Decoding JSON failed while updating project: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if !validateUpdateRequest(updateReq) {
		log.Errorf(c, "Project update validation failed")
		http.Error(w, "Invalid project update request", http.StatusBadRequest)
		return
	}

	p.Name = updateReq.Name
	p.Description = updateReq.Description
	p.InvoiceAddr = updateReq.InvoiceAddr
	p.CustomerOrg = updateReq.CustomerOrg
	p.CustomerName = updateReq.CustomerName
	p.CustomerEmail = updateReq.CustomerEmail
	p.CustomerPhone = updateReq.CustomerPhone
	p.CustomerReference = updateReq.CustomerReference
	p.InternalReference = updateReq.InternalReference
	p.SampleLocation = updateReq.SampleLocation
	p.AdditionalInfo = updateReq.AdditionalInfo

	_, err := datastore.Put(c, key, &p)

	if err != nil {
		log.Errorf(c, "Updating project failed: %v", err)
		http.Error(w, "Updating project failed", http.StatusInternalServerError)
		return
	}

}
func validateUpdateRequest(updateRequest ProjectUpdateRequest) bool {
	return len(updateRequest.Name) > 0 && len(updateRequest.CustomerOrg) > 0 &&
		len(updateRequest.Description) > 0
}

func validateName(c context.Context, project *Project) (bool, string) {
	match, _ := regexp.MatchString("^[\\w_-]*$", project.Name)
	if !match {
		return false, "Project name is invalid"
	}

	q := datastore.NewQuery(projectKind).KeysOnly().Filter("Name = ", project.Name).Limit(1)
	t := q.Run(c)
	key, _ := t.Next(nil)

	if key != nil {
		return false, "Project name is not unique"
	}
	return true, ""
}

func routeProjectStatusUpdate(w http.ResponseWriter, r *http.Request, p Project, key *datastore.Key) {
	c := appengine.NewContext(r)

	statusCode, err := strconv.ParseInt(r.FormValue("status"), 10, 64)
	if err != nil {
		log.Errorf(c, "Parsing project id failed: %v", err)
		http.Error(w, "", http.StatusBadRequest)
		return
	}

	if statusCode <= 0 || statusCode > 3 {
		log.Errorf(c, "Wrong status code, got: %d", statusCode)
		http.Error(w, "Unknown project status", http.StatusBadRequest)
		return
	}

	p.Status = ProjectStatus(statusCode)

	_, err = datastore.Put(c, key, &p)
	if err != nil {
		log.Errorf(c, "Error while saving status %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Write(mustJSON(p.Status))
}
