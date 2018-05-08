package main

import (
	"net/http"
	"context"
	"strconv"
	"time"

	"google.golang.org/appengine/log"
	"google.golang.org/appengine"
	"google.golang.org/appengine/file"
	"cloud.google.com/go/storage"
)

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

	getStorageUrl(c, fileName, w, id)

}
func getStorageUrl(c context.Context, fileName string, w http.ResponseWriter, id int64) {
	acc, _ := appengine.ServiceAccount(c)

	bucket, err := file.DefaultBucketName(c)

	url, err := storage.SignedURL(bucket, strconv.Itoa(int(id))+"\\"+fileName, &storage.SignedURLOptions{
		Expires:        time.Now().Add(time.Hour * 24),
		Method:         http.MethodPut,
		GoogleAccessID: acc,
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
