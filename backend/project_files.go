package main

import (
	"net/http"
	"context"
	"strconv"
	"time"
	"regexp"

	"google.golang.org/appengine/log"
	"google.golang.org/appengine"
	"google.golang.org/appengine/file"
	"cloud.google.com/go/storage"
)

var fileNamePattern = regexp.MustCompile(`^[\w_\-.]*$`)

func routeProjectFile(w http.ResponseWriter, r *http.Request, id int64) {

	switch r.Method {
	case http.MethodPost:
		routeProjectFileUrlRequest(w, r, id)
		return
	default:
		http.Error(w, "", http.StatusMethodNotAllowed)
		return
	}

}
func routeProjectFileUrlRequest(w http.ResponseWriter, r *http.Request, id int64) {
	c := appengine.NewContext(r)
	fileName := r.FormValue("filename")

	if !fileNamePattern.Match([]byte(fileName)) {
		http.Error(w, "File name is invalid", http.StatusBadRequest)
		return
	}

	if !isFileNameAvailable(c, fileName, id) {
		http.Error(w, "Filename must be unique", http.StatusBadRequest)
		return
	}

	getStorageUrl(c, fileName, w, id)

}
func isFileNameAvailable(c context.Context, fileName string, id int64) bool {
	client, err := storage.NewClient(c)
	if err != nil {
		log.Errorf(c, "Failed to create a Storage client", err)
		return false
	}

	defer client.Close()

	bucketName, err := file.DefaultBucketName(c)

	if err != nil {
		log.Errorf(c, "Getting default bucket name failed", err)
	}

	_, err = client.Bucket(bucketName).Object(strconv.Itoa(int(id)) + "/" + fileName).Attrs(c)

	if err != nil && err != storage.ErrObjectNotExist {
		log.Errorf(c, "File name availability check failed", err)
	}

	if err == storage.ErrObjectNotExist {
		return true
	}

	return false

}
func getStorageUrl(c context.Context, fileName string, w http.ResponseWriter, id int64) {
	acc, _ := appengine.ServiceAccount(c)

	bucket, err := file.DefaultBucketName(c)

	if len(acc) == 0 {
		//acc = "Add the project's service account here when testing locally"
	}

	url, err := storage.SignedURL(bucket, strconv.Itoa(int(id))+"/"+fileName, &storage.SignedURLOptions{
		Expires:        time.Now().Add(time.Hour * 24),
		Method:         http.MethodPut,
		GoogleAccessID: acc,
		ContentType:    "text/plain",
		SignBytes: func(b []byte) ([]byte, error) {
			_, signedBytes, err := appengine.SignBytes(c, b)
			return signedBytes, err
		},
	})

	if err != nil {
		log.Errorf(c, "Failed to generate signed url", err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Write([]byte(url))

}
