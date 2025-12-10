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

	ErrRetrieveDatabase         = "Failed to retrieve database in %s"
	ErrCreateUser               = "Failed to create user in %s"
	SuccessfulCreateUserMessage = "User created successfully"
	ErrEncodeView               = "Failed to retrieve users in %s"
	ErrRequestBody              = "Invalid request body in %s"
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

	data, err := json.Marshal(u)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrEncodeView, CreateUser))
	}

	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulCreateUserMessage},
	}, nil
}

// internal/handlers/users/users.go

func HandleLogin(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	// 1. Read the name tag
	var request struct {
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		return nil, errors.Wrap(err, "Invalid request")
	}

	// 2. Open Kitchen
	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, "Database unavailable")
	}

	// 3. Find the user
	u, err := dataaccess.GetUserByUsername(db, request.Username)
	if err != nil {
		return nil, errors.Wrap(err, "User not found")
	}

	// 4. Give them their "Token" (The User ID)
	// In a real app, you would generate a secure random string here (JWT/Session ID).
	// For this simple example, the UserID IS the token.
	return &api.Response{
		Payload: api.Payload{
			// We return it in a format the frontend can easily save
			Data: json.RawMessage(fmt.Sprintf(`{"token": "%d"}`, u.ID)),
		},
		Messages: []string{"Login successful"},
	}, nil
}
