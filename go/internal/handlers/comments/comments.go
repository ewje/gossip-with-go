package comments

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/ewje/gossip-with-go/internal/api"
	"github.com/ewje/gossip-with-go/internal/dataaccess"
	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
	"github.com/go-chi/chi"
	"github.com/pkg/errors"
)

const (
	ListComments  = "posts.HandleListComments"
	CreateComment = "posts.HandleCreateComment"
	UpdateComment = "posts.HandleUpdateComment"
	DeleteComment = "posts.HandleDeleteComment"

	ErrRetrieveDatabase = "Failed to retrieve database in %s"
	ErrListComments     = "Failed to list comments in %s"
	ErrCreateComment    = "Failed to create comment in %s"
	ErrUpdateComment    = "Failed to update comment in %s"
	ErrDeleteComment    = "Failed to delete comment in %s"
	ErrRequestBody      = "Invalid request body in %s"
	ErrInvalidId        = "Invalid comment id in %s"

	SuccessfulCreateCommentMessage = "Comment created successfully"
	SuccessfulListCommentsMessage  = "Comments listed successfully"
	SuccessfulUpdateCommentMessage = "Comment update successfully"
	SuccessfulDeleteCommentMessage = "Comment deleted successfully"
)

func HandleListComments(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	postID := chi.URLParam(r, "postID")
	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, ListComments))
	}

	comments, err := dataaccess.ListCommentsByPost(db, postID)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrListComments, ListComments))
	}

	data, _ := json.Marshal(comments)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulListCommentsMessage},
	}, nil
}

func HandleCreateComment(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	var c models.Comment
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRequestBody, CreateComment))
	}

	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, CreateComment))
	}

	c, err = dataaccess.CreateComment(db, c)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrCreateComment, CreateComment))
	}

	data, _ := json.Marshal(c)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulCreateCommentMessage},
	}, nil
}

func HandleUpdateComment(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	idStr := chi.URLParam(r, "commentID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrInvalidId, UpdateComment))
	}

	// 2. Read the Changes: Decode the JSON body (new title/content)
	var c models.Comment
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRequestBody, UpdateComment))
	}

	// Important: Force the ID from the URL into the struct
	c.ID = id

	// 3. Open Kitchen Door
	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, UpdateComment))
	}

	// 4. Tell the Chef
	updatedPost, err := dataaccess.UpdateComment(db, c)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrUpdateComment, UpdateComment))
	}

	// 5. Reply to Customer
	data, _ := json.Marshal(updatedPost)
	return &api.Response{
		Payload:  api.Payload{Data: data},
		Messages: []string{SuccessfulUpdateCommentMessage},
	}, nil
}

func HandleDeleteComment(w http.ResponseWriter, r *http.Request) (*api.Response, error) {
	// 1. Identify the Post: Read the ID from the URL
	idStr := chi.URLParam(r, "commentID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrInvalidId, DeleteComment))
	}

	// 2. Open Kitchen Door
	db, err := database.GetDB()
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrRetrieveDatabase, DeleteComment))
	}

	// 3. Tell the Chef
	if err := dataaccess.DeleteComment(db, id); err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf(ErrDeleteComment, DeleteComment))
	}

	// 4. Reply to Customer
	// Note: We don't return any data payload for a delete, just a success message.
	return &api.Response{
		Messages: []string{SuccessfulDeleteCommentMessage},
	}, nil
}
