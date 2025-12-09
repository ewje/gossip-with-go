package topics

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
	ErrListTopics       = "Failed to list topics"
	ErrCreateTopic      = "Failed to create topic"
)

func HandleListTopics(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, ErrRetrieveDatabase)
	}

	topics, err := dataaccess.ListTopics(db)
	if err != nil {
		return nil, errors.Wrap(err, ErrListTopics)
	}

	data, _ := json.Marshal(topics)
	return &api.Response{Payload: api.Payload{Data: data}, Messages: []string{"Topics listed successfully"}}, nil
}

func HandleCreateTopic(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	var t models.Topic
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		return nil, errors.Wrap(err, "Invalid request body")
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, ErrRetrieveDatabase)
	}

	t, err = dataaccess.CreateTopic(db, t)
	if err != nil {
		return nil, errors.Wrap(err, ErrCreateTopic)
	}

	data, _ := json.Marshal(t)
	return &api.Response{Payload: api.Payload{Data: data}, Messages: []string{"Topic created successfully"}}, nil
}
