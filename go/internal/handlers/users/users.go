package users

import (
	"encoding/json"
	"net/http"

	"github.com/ewje/gossip-with-go/internal/api"
	"github.com/ewje/gossip-with-go/internal/dataaccess"
	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
	"github.com/pkg/errors"
)

const (
	ErrRetrieveDatabase = "Failed to retrieve database"
	ErrCreateUser       = "Failed to create user"
)

func HandleCreateUser(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	var u models.User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		return nil, errors.Wrap(err, "Invalid request body")
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, ErrRetrieveDatabase)
	}

	u, err = dataaccess.CreateUser(db, u)
	if err != nil {
		return nil, errors.Wrap(err, ErrCreateUser)
	}

	data, _ := json.Marshal(u)
	return &api.Response{Payload: api.Payload{Data: data}, Messages: []string{"User created successfully"}}, nil
}
