package main

import (
	"encoding/json"
	"net/http"
	"path"
	"strings"
)

func init() {
	http.HandleFunc("/api/", routeApi)
}

func routeApi(w http.ResponseWriter, r *http.Request) {
	var head string
	_, r.URL.Path = shiftPath(r.URL.Path) // remove /api
	head, r.URL.Path = shiftPath(r.URL.Path)

	switch head {
	// /api/admin/
	case "admin":
		routeAdmin(w, r)
		return

	// /api/projects/
	case "projects":
		routeProjects(w, r)
		return

	// /api/tasks/
	case "tasks":
		routeTasks(w, r)
		return
	}

	http.Error(w, "", http.StatusNotFound)
}

func shiftPath(p string) (head, tail string) {
	p = path.Clean("/" + p)
	i := strings.Index(p[1:], "/") + 1
	if i <= 0 {
		return p[1:], "/"
	}
	return p[1:i], p[i:]
}

func mustJSON(v interface{}) []byte {
	b, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	return b
}
