package main

import (
	"fmt"
	"net/http"
	"strings"
)

func init() {
	http.HandleFunc("/api/", routeApi)
	http.HandleFunc("/api/projects/add", createProject)
}

func routeApi(w http.ResponseWriter, r *http.Request) {

	if strings.HasPrefix(r.URL.Path, "/api/admin/") {
		fmt.Fprintf(w, "Hello Admin!")
		return
	}

	if strings.HasPrefix(r.URL.Path, "/api/") {
		fmt.Fprintf(w, "Hello")
		return
	}

	http.Error(w, "", http.StatusNotFound)
}
