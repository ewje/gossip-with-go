package posts

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
	ListPosts  = "posts.HandleListPosts"
	FetchPost  = "posts.HandleFetchPost"
	CreatePost = "posts.HandleCreatePost"
	UpdatePost = "posts.HandleUpdatePost"
	DeletePost = "posts.HandleDeletePost"

	ErrRetrieveDatabase = "Failed to retrieve database in %s"
	ErrListPosts        = "Failed to list posts in %s"
	ErrCreatePost       = "Failed to create post in %s"
	ErrUpdatePost       = "Failed to update post in %s"
	ErrDeletePost       = "Failed to delete post in %s"
	ErrRequestBody      = "Invalid request body in %s"
	ErrInvalidId        = "Invalid post id in %s"

	SuccessfulCreatePostMessage = "Post created successfully"
	SuccessfulListPostsMessage  = "Posts listed successfully"
	SuccessfulUpdatePostMessage = "Post update successfully"
	SuccessfulDeletePostMessage = "Post deleted successfully"
	SuccessfulFetchPostMessage  = "Post fetched successfully"
)

func HandleListPosts(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	topicID := chi.URLParam(r, "topicID")
	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, ListPosts))
	}

	posts, err := dataaccess.ListPostsByTopic(db, topicID)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrListPosts, ListPosts))
	}

	data, _ := json.Marshal(posts)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulListPostsMessage},
	}, nil
}

func HandleFetchPost(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	idStr := chi.URLParam(r, "postID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrInvalidId, FetchPost))
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, FetchPost))
	}

	topic, err := dataaccess.FetchPost(db, id)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrListPosts, FetchPost))
	}

	data, _ := json.Marshal(topic)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulFetchPostMessage},
	}, nil
}

func HandleCreatePost(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	var p models.Post
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRequestBody, CreatePost))
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, CreatePost))
	}

	p, err = dataaccess.CreatePost(db, p)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrCreatePost, CreatePost))
	}

	data, _ := json.Marshal(p)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulCreatePostMessage},
	}, nil
}

func HandleUpdatePost(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	idStr := chi.URLParam(r, "postID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrInvalidId, UpdatePost))
	}

	var p models.Post
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRequestBody, UpdatePost))
	}

	p.ID = id

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, UpdatePost))
	}

	updatedPost, err := dataaccess.UpdatePost(db, p)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrUpdatePost, UpdatePost))
	}

	data, _ := json.Marshal(updatedPost)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulUpdatePostMessage},
	}, nil
}

func HandleDeletePost(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	idStr := chi.URLParam(r, "postID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrInvalidId, DeletePost))
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, DeletePost))
	}

	if err := dataaccess.DeletePost(db, id); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrDeletePost, DeletePost))
	}

	return &api.Response{
		Messages: []string{SuccessfulDeletePostMessage},
	}, nil
}
