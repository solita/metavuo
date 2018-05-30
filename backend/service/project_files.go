package service

import (
	"context"
	"net/http"
	"path/filepath"
	"regexp"
	"strconv"
	"time"

	"cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
	"google.golang.org/appengine"
	"google.golang.org/appengine/file"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
)

var fileNamePattern = regexp.MustCompile(`^[\w_\-.]*$`)

type ProjectFile struct {
	GenerationID int64     `json:"id"`
	FileName     string    `json:"fileName"`
	FileSize     int64     `json:"fileSize"`
	Created      time.Time `json:"created"`
	CreatedBy    string    `json:"createdBy"`
	Description  string    `json:"description"`
	FileType     string    `json:"filetype"`
}

func routeProjectFile(w http.ResponseWriter, r *http.Request, id int64) {
	var head string
	head, r.URL.Path = shiftPath(r.URL.Path)

	if head == "" {
		switch r.Method {
		case http.MethodGet:
			routeProjectFileList(w, r, id)
			return
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}
	}

	if head == "generate-upload-url" {
		switch r.Method {
		case http.MethodPost:
			routeProjectFileUrlRequest(w, r, id)
			return
		default:
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}
	}

	// head = file name
	switch r.Method {
	case http.MethodGet:
		routeProjectFileGet(w, r, id, head)
		return
	case http.MethodDelete:
		routeProjectFileDelete(w, r, id, head)
	default:
		http.Error(w, "", http.StatusMethodNotAllowed)
		return
	}
}

func routeProjectFileUrlRequest(w http.ResponseWriter, r *http.Request, id int64) {
	c := appengine.NewContext(r)
	fileName := r.FormValue("filename")
	description := r.FormValue("description")
	fileType := r.FormValue("fileType")

	if !fileNamePattern.Match([]byte(fileName)) {
		http.Error(w, "File name is invalid", http.StatusBadRequest)
		return
	}

	if !isFileNameAvailable(c, fileName, id) {
		http.Error(w, "Filename must be unique", http.StatusBadRequest)
		return
	}

	getStorageUrl(c, fileName, w, id, description, fileType)

}

func isFileNameAvailable(c context.Context, fileName string, id int64) bool {
	client, err := storage.NewClient(c)
	if err != nil {
		log.Errorf(c, "Failed to create a Storage client: %v", err)
		return false
	}

	defer client.Close()

	bucketName, err := file.DefaultBucketName(c)

	if err != nil {
		log.Errorf(c, "Getting default bucket name failed: %v", err)
	}

	_, err = client.Bucket(bucketName).Object(strconv.Itoa(int(id)) + "/" + fileName).Attrs(c)

	if err != nil && err != storage.ErrObjectNotExist {
		log.Errorf(c, "File name availability check failed: %v", err)
	}

	if err == storage.ErrObjectNotExist {
		return true
	}

	return false

}

func getStorageUrl(c context.Context, fileName string, w http.ResponseWriter, id int64, description string, fileType string) {
	acc, _ := appengine.ServiceAccount(c)
	uploadedBy := user.Current(c).Email

	bucket, err := file.DefaultBucketName(c)

	if len(acc) == 0 {
		//acc = "Add the project's service account here when testing locally"
	}

	url, err := storage.SignedURL(bucket, strconv.Itoa(int(id))+"/"+fileName, &storage.SignedURLOptions{
		Expires:        time.Now().Add(time.Hour * 24),
		Method:         http.MethodPut,
		GoogleAccessID: acc,
		ContentType:    "text/plain",
		Headers: []string{"x-goog-meta-uploadedby:" + uploadedBy,
			"x-goog-meta-description:" + description, "x-goog-meta-filetype:" + fileType},
		SignBytes: func(b []byte) ([]byte, error) {
			_, signedBytes, err := appengine.SignBytes(c, b)
			return signedBytes, err
		},
	})

	if err != nil {
		log.Errorf(c, "Failed to generate signed upload-url: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Write([]byte(url))

}

func routeProjectFileList(w http.ResponseWriter, r *http.Request, id int64) {
	c := appengine.NewContext(r)
	client, err := storage.NewClient(c)
	if err != nil {
		log.Errorf(c, "Failed to create a Storage client: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	defer client.Close()

	bucket, err := file.DefaultBucketName(c)

	query := &storage.Query{Prefix: strconv.Itoa(int(id))}
	it := client.Bucket(bucket).Objects(c, query)

	var files []ProjectFile

	for {
		item, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Errorf(c, "Failed to get storage file list: %v", err)
			http.Error(w, "", http.StatusInternalServerError)
			return
		}

		if item.Size > 0 {
			files = append(files, ProjectFile{
				item.Generation,
				filepath.Base(item.Name),
				item.Size,
				item.Created,
				item.Metadata["uploadedby"],
				item.Metadata["description"],
				item.Metadata["filetype"],
			})
		}
	}
	if len(files) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.Write(mustJSON(files))
	}
}

func routeProjectFileGet(w http.ResponseWriter, r *http.Request, id int64, fileName string) {
	c := appengine.NewContext(r)

	acc, _ := appengine.ServiceAccount(c)

	bucket, err := file.DefaultBucketName(c)

	if len(acc) == 0 {
		//acc = "Add the project's service account here when testing locally"
	}

	url, err := storage.SignedURL(bucket, strconv.Itoa(int(id))+"/"+fileName, &storage.SignedURLOptions{
		Expires:        time.Now().Add(time.Hour * 8),
		Method:         http.MethodGet,
		GoogleAccessID: acc,
		SignBytes: func(b []byte) ([]byte, error) {
			_, signedBytes, err := appengine.SignBytes(c, b)
			return signedBytes, err
		},
	})

	if err != nil {
		log.Errorf(c, "Failed to generate signed download-url: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, url, http.StatusSeeOther)

}

func routeProjectFileDelete(w http.ResponseWriter, r *http.Request, id int64, fileName string) {
	c := appengine.NewContext(r)
	client, err := storage.NewClient(c)
	if err != nil {
		log.Errorf(c, "Failed to create a Storage client: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	defer client.Close()

	bucket, err := file.DefaultBucketName(c)

	if err != nil {
		log.Errorf(c, "Failed to get default bucket: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	err = client.Bucket(bucket).Object(strconv.Itoa(int(id)) + "/" + fileName).Delete(c)

	if err != nil {
		log.Errorf(c, "Failed to delete file from storage: %v", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
}
