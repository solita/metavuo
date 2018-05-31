package service

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/solita/metavuo/backend/users"
	"google.golang.org/appengine"
	"google.golang.org/appengine/aetest"
)

// mainInst contains the instance of the app
// Tests can create new instances to be used in the test
// but using the global instance the tests run faster
// as the instance startup takes a while
var mainInst aetest.Instance

// TestMain will be called when the testing begins
// It will create an instance and a context which can be
// used in all tests
// Each test is responsible of cleanup
func TestMain(m *testing.M) {
	// create instance
	// this instance will use strongly consistent datastore so queries match
	// the current state of test.
	var err error
	mainInst, err = aetest.NewInstance(&aetest.Options{StronglyConsistentDatastore: true})
	if err != nil {
		panic(err)
	}
	defer mainInst.Close()

	os.Exit(m.Run())
}

func TestUnregisteredUsersShouldNotGetProjectList(t *testing.T) {

	req, err := mainInst.NewRequest("GET", "/api/projects/", nil)
	if err != nil {
		panic(err)
	}
	//req.Header.Set("X-AppEngine-User-Nickname", "")
	req.Header.Set("X-AppEngine-User-Email", "a@example.com")
	req.Header.Set("X-AppEngine-Auth-Domain", "gmail.com")
	req.Header.Set("X-AppEngine-User-Is-Admin", "0")
	resp := httptest.NewRecorder()

	http.DefaultServeMux.ServeHTTP(resp, req)
	if resp.Code != http.StatusForbidden {
		t.Fatalf("Non-admin should not get users! Response code: %v", resp.Code)
		return
	}
}

func TestRegisteredUsersShouldGetProjectList(t *testing.T) {
	req, err := mainInst.NewRequest("GET", "/api/projects/", nil)
	if err != nil {
		panic(err)
	}
	//req.Header.Set("X-AppEngine-User-Nickname", "")
	req.Header.Set("X-AppEngine-User-Email", "a@example.com")
	req.Header.Set("X-AppEngine-Auth-Domain", "gmail.com")
	req.Header.Set("X-AppEngine-User-Is-Admin", "0")
	resp := httptest.NewRecorder()

	c := appengine.NewContext(req)
	_, err = users.Create(c, "name", "a@example.com", "org", "creatorID", "creatorEmail")
	if err != nil {
		t.Fatalf("Could not create user: %v", err)
		return
	}

	http.DefaultServeMux.ServeHTTP(resp, req)
	if resp.Code != http.StatusOK {
		t.Fatalf("Registered user should get projects, got response code: %v", resp.Code)
		return
	}
}
