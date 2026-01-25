package users

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/ewje/gossip-with-go/internal/api"
	"github.com/ewje/gossip-with-go/internal/dataaccess"
	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
	"github.com/pkg/errors"
)

const (
	CreateUser = "user.HandleCreateUser"
	LoginUser  = "user.HandleLogin"
	ListUsers  = "user.HandleListUsers"

	ErrRetrieveDatabase         = "Failed to retrieve database in %s"
	ErrCreateUser               = "Failed to create user in %s"
	SuccessfulCreateUserMessage = "User created successfully"
	ErrListUsers                = "Failed to list users in %s"
	SuccessfulListUsersMessage  = "Users listed successfully"
	ErrEncodeView               = "Failed to retrieve users in %s"
	ErrRequestBody              = "Invalid request body in %s"
	ErrLogin                    = "User not found in %s"
)

func HandleCreateUser(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	var u models.User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRequestBody, CreateUser))
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, CreateUser))
	}

	u, err = dataaccess.CreateUser(db, u)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrCreateUser, CreateUser))
	}

	u, err = dataaccess.GetUserByUsername(db, u.Username)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrLogin, CreateUser))
	}

	/*data, err := json.Marshal(u)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrEncodeView, CreateUser))
	}*/

	return &api.Response{
		Payload: api.Payload{
			// We return it in a format the frontend can easily save
			Data: json.RawMessage(fmt.Sprintf(`{"token": "%d"}`, u.ID)),
		},
		Messages: []string{"Login successful"},
	}, nil
}

// internal/handlers/users/users.go

func HandleLogin(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	var request struct {
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRequestBody, LoginUser))
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, LoginUser))
	}

	u, err := dataaccess.GetUserByUsername(db, request.Username)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrLogin, LoginUser))
	}

	return &api.Response{
		Payload: api.Payload{
			// We return it in a format the frontend can easily save
			Data: json.RawMessage(fmt.Sprintf(`{"token": "%d"}`, u.ID)),
		},
		Messages: []string{"Login successful"},
	}, nil
}

func HandleListUsers(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, ListUsers))
	}

	users, err := dataaccess.ListUsers(db)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrListUsers, ListUsers))
	}

	data, _ := json.Marshal(users)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulListUsersMessage},
	}, nil
}
