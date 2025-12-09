package posts

import (
	"encoding/json"
	"net/http"

	"github.com/ewje/gossip-with-go/internal/api"
	"github.com/ewje/gossip-with-go/internal/dataaccess"
	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/pkg/errors"
)

const (
	ErrRetrieveDatabase = "Failed to retrieve database"
	ErrListPosts        = "Failed to list posts"
	ErrCreatePost       = "Failed to create post"
)

func HandleListPosts(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	topicID := chi.URLParam(r, "topicID")
	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, ErrRetrieveDatabase)
	}

	posts, err := dataaccess.ListPostsByTopic(db, topicID)
	if err != nil {
		return nil, errors.Wrap(err, ErrListPosts)
	}

	data, _ := json.Marshal(posts)
	return &api.Response{Payload: api.Payload{Data: data}, Messages: []string{"Posts listed successfully"}}, nil
}

func HandleCreatePost(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	var p models.Post
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		return nil, errors.Wrap(err, "Invalid request body")
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, ErrRetrieveDatabase)
	}

	p, err = dataaccess.CreatePost(db, p)
	if err != nil {
		return nil, errors.Wrap(err, ErrCreatePost)
	}

	data, _ := json.Marshal(p)
	return &api.Response{Payload: api.Payload{Data: data}, Messages: []string{"Post created successfully"}}, nil
}
