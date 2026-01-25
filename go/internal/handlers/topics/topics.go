package topics

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/ewje/gossip-with-go/internal/api"
	"github.com/ewje/gossip-with-go/internal/dataaccess"
	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/pkg/errors"
)

const (
	ListTopics   = "topics.HandleListTopics"
	FetchTopic   = "topics.HandleFetchTopic"
	CreateTopics = "topics.HandleCreateTopic"
	UpdateTopics = "topics.HandleUpdatetopic"
	DeleteTopics = "topics.HandleDeletetopic"

	ErrRetrieveDatabase = "Failed to retrieve database in %s"
	ErrListTopics       = "Failed to list topics in %s"
	ErrCreateTopic      = "Failed to create topic in %s"
	ErrUpdateTopic      = "Failed to update topic in %s"
	ErrDeleteTopic      = "Failed to delete topic in %s"
	ErrRequestBody      = "Invalid request body in %s"
	ErrInvalidId        = "Invalid topic id in %s"

	SuccessfulCreateTopicMessage = "Topic created successfully"
	SuccessfulListTopicsMessage  = "Topics listed successfully"
	SuccessfulUpdateTopicMessage = "Topic update successfully"
	SuccessfulDeleteTopicMessage = "Topic deleted successfully"
	SuccessfulFetchTopicMessage  = "Topic fetched successfully"
)

func HandleListTopics(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, CreateTopics))
	}

	topics, err := dataaccess.ListTopics(db)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrListTopics, CreateTopics))
	}

	data, _ := json.Marshal(topics)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulListTopicsMessage},
	}, nil
}

func HandleFetchTopic(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	idStr := chi.URLParam(r, "topicID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrInvalidId, FetchTopic))
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, FetchTopic))
	}

	topic, err := dataaccess.FetchTopic(db, id)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrListTopics, FetchTopic))
	}

	data, _ := json.Marshal(topic)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulFetchTopicMessage},
	}, nil
}

func HandleCreateTopic(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	var t models.Topic
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRequestBody, CreateTopics))
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, CreateTopics))
	}

	t, err = dataaccess.CreateTopic(db, t)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrCreateTopic, CreateTopics))
	}

	data, _ := json.Marshal(t)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulCreateTopicMessage},
	}, nil
}

func HandleUpdateTopic(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	idStr := chi.URLParam(r, "topicID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrInvalidId, UpdateTopics))
	}

	var t models.Topic
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRequestBody, UpdateTopics))
	}

	t.ID = id

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, UpdateTopics))
	}

	updatedTopic, err := dataaccess.UpdateTopic(db, t)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrUpdateTopic, UpdateTopics))
	}

	data, _ := json.Marshal(updatedTopic)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulUpdateTopicMessage},
	}, nil
}

func HandleDeleteTopic(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	idStr := chi.URLParam(r, "topicID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrInvalidId, DeleteTopics))
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, DeleteTopics))
	}

	if err := dataaccess.DeleteTopic(db, id); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrDeleteTopic, DeleteTopics))
	}

	return &api.Response{
		Messages: []string{SuccessfulDeleteTopicMessage},
	}, nil
}
