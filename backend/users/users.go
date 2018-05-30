package users

import (
	"time"
	"regexp"
	"errors"
	"context"
	
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
	"google.golang.org/appengine/datastore"
)

const (
	userKind = "AppUser"
)

var (
	emailRegex        = regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	ErrEmailNotUnique = errors.New("users: user with email already exists")
	ErrEmailInvalid   = errors.New("users: email address is not valid")
	ErrNameEmpty      = errors.New("users: name is empty")
	ErrOrgEmpty       = errors.New("users: organization is empty")
	ErrNoSuchUser     = errors.New("users: user not found")
)

type AppUser struct {
	ID           int64     `datastore:"-" json:"user_id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Organization string    `json:"organization"`
	CreatedBy    string    `json:"-"`
	CreatedByID  string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

func Create(c context.Context, name, email, organization string) (*AppUser, error) {

	if !emailRegex.MatchString(email) {
		return nil, ErrEmailInvalid
	}
	isUnique, err := isEmailUnique(c, email)

	if err != nil {
		log.Errorf(c, "Counting users failed %v", err)
		return nil, err
	}

	if !isUnique {
		return nil, ErrEmailNotUnique
	}

	if name == "" {
		return nil, ErrNameEmpty
	}

	if organization == "" {
		return nil, ErrOrgEmpty
	}
	appUser := AppUser{
		Name:         name,
		Organization: organization,
		Email:        email,
		CreatedByID:  user.Current(c).ID,
		CreatedBy:    user.Current(c).Email,
		CreatedAt:    time.Now().UTC(),
	}

	key := datastore.NewIncompleteKey(c, userKind, nil)
	key, err = datastore.Put(c, key, &appUser)

	if err != nil {
		log.Errorf(c, "Adding user failed %v", err)
		return nil, err
	}

	appUser.ID = key.IntID()

	return &appUser, nil
}

func isEmailUnique(c context.Context, email string) (bool, error) {
	q := datastore.NewQuery(userKind).KeysOnly().Filter("Email = ", email).Limit(1)
	n, err := q.Count(c)
	if err != nil {
		return false, err
	}

	if n > 0 {
		return false, nil
	}

	return true, nil
}

func Delete(c context.Context, id int64) error {

	key := datastore.NewKey(c, userKind, "", id, nil)
	err := datastore.Delete(c, key)

	if err != nil {
		if err == datastore.ErrNoSuchEntity {
			return ErrNoSuchUser
		}
		return err
	}

	return nil
}

func List(c context.Context) ([]AppUser, error) {
	q := datastore.NewQuery(userKind).Limit(500).Order("Name")

	var uList []AppUser
	keys, err := q.GetAll(c, &uList)

	if err != nil {
		return nil, err
	}

	for i := range uList {
		uList[i].ID = keys[i].IntID()
	}

	return uList, nil
}

func GetIDByEmail(c context.Context, email string) (int64, error) {

	q := datastore.NewQuery(userKind).Filter("Email = ", email).Limit(1).KeysOnly()

	keys, err := q.GetAll(c, nil)
	if err != nil {
		log.Errorf(c, "Error while getting user: %v", err)
		return 0, err
	}

	if len(keys) == 0 {
		log.Errorf(c, "User not found")
		return 0, ErrNoSuchUser
	}

	return keys[0].IntID(), nil
}

func GetMulti(c context.Context, ids []int64) ([]AppUser, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	keys := make([]*datastore.Key, 0, len(ids))
	for _, id := range ids {
		keys = append(keys, datastore.NewKey(c, userKind, "", id, nil))
	}

	var users = make([]AppUser, len(keys))
	err := datastore.GetMulti(c, keys, users)
	if err != nil {
		return nil, err
	}

	return users, nil
}
