package users

import (
	"context"
	"os"
	"testing"

	"google.golang.org/appengine"
	"google.golang.org/appengine/aetest"
)

// mainInst contains the instance of the app
// Tests can create new instances to be used in the test
// but using the global instance the tests run faster
// as the instance startup takes a while
var mainInst aetest.Instance

// mainCtx contains a context that can be used in all tests
// by reusing the same context we speed up the testing as
// each test doesn't need to launch a new server
var mainCtx context.Context

// TestMain will be called when the testing begins
// It will create an instance and a context which can be
// used in all tests
// Each test is responsible of cleanup
func TestMain(m *testing.M) {
	// create instance
	// this instance will use strongly consistent datastore so queries match
	// the current state of test.
	inst, err := aetest.NewInstance(&aetest.Options{StronglyConsistentDatastore: true})
	if err != nil {
		panic(err)
	}
	defer inst.Close()

	// create dummy request to get the context
	req, err := inst.NewRequest("GET", "/", nil)
	if err != nil {
		panic(err)
	}
	mainCtx = appengine.NewContext(req)

	os.Exit(m.Run())
}

func TestIsEmailUnique(t *testing.T) {

	isUnique, err := isEmailUnique(mainCtx, "doesnotexisist@example.com")
	if err != nil {
		t.Fatalf("Failed to check email uniqueness: %v", err)
		return
	}

	if !isUnique {
		t.Errorf("Email should be unique in empty datastore")
	}

	user, err := Create(mainCtx, "name", "name@example.com", "org", "creator", "creator@example.com")
	if err != nil {
		t.Fatalf("Could not create user: %v", err)
		return
	}

	isUnique, err = isEmailUnique(mainCtx, "name@example.com")
	if err != nil {
		t.Fatalf("Failed to check email uniqueness: %v", err)
		return
	}

	if isUnique {
		t.Errorf("Email should not be unique")
	}

	err = Delete(mainCtx, user.ID)
	if err != nil {
		t.Fatal("Could not delete user: %v", err)
		return
	}
}
func TestDeleteUser(t *testing.T) {

	err := Delete(mainCtx, 1234)
	if err == nil {
		t.Errorf("No error on deleting non-existing user")
	} else if err != ErrNoSuchUser {
		t.Errorf("Delete user failed: %v", err)
	} else {
		// the error was ErrNoSuchUser -> expected
	}

	user, err := Create(mainCtx, "name", "name@example.com", "org", "creator", "creator@example.com")
	if err != nil {
		t.Fatalf("Could not create user: %v", err)
		return
	}
	err = Delete(mainCtx, user.ID)
	if err != nil {
		t.Error("Could not delete user: %v", err)
	}
	// check that user doesn't exist
	users, err := List(mainCtx)
	if err != nil {
		t.Fatalf("Could not list users")
		return
	}

	if len(users) != 0 {
		t.Fatalf("There should be no users, was: %v", len(users))
		return
	}
}
