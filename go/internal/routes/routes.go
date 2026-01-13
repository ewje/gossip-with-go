package routes

import (
	"encoding/json"
	"net/http"

	"github.com/ewje/gossip-with-go/internal/api"
	"github.com/ewje/gossip-with-go/internal/handlers/comments"
	"github.com/ewje/gossip-with-go/internal/handlers/posts"
	"github.com/ewje/gossip-with-go/internal/handlers/topics"
	"github.com/ewje/gossip-with-go/internal/handlers/users"
	"github.com/go-chi/chi/v5"
)

func GetRoutes() func(r chi.Router) {
	return func(r chi.Router) {
		// Users
		r.Post("/users", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, users.HandleCreateUser)
		})
		r.Post("/login", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, users.HandleLogin)
		})

		// Topics
		r.Get("/topics", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, topics.HandleListTopics)
		})
		r.Post("/topics", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, topics.HandleCreateTopic)
		})
		r.Put("/topics/{topicID}", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, topics.HandleUpdateTopic)
		})
		r.Delete("/topics/{topicsID}", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, topics.HandleDeleteTopic)
		})

		// Posts
		r.Get("/topics/{topicID}/posts", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, posts.HandleListPosts)
		})
		r.Post("/posts", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, posts.HandleCreatePost)
		})
		r.Put("/posts/{postID}", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, posts.HandleUpdatePost)
		})
		r.Delete("/posts/{postID}", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, posts.HandleDeletePost)
		})

		//Comments
		r.Get("/posts/{postID}/comments", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, comments.HandleListComments)
		})
		r.Post("/comments", func(w http.ResponseWriter, req *http.Request) {
			handleRequest(w, req, comments.HandleCreateComment)
		})
	}
}

// handleRequest is a helper to standardize how we execute handlers and write JSON responses
func handleRequest(w http.ResponseWriter, r *http.Request, handler func(http.ResponseWriter, *http.Request) (*api.Response, error)) {
	response, err := handler(w, r)

	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		// In a real app, you might check specific error types to set 400 vs 500 status codes
		w.WriteHeader(http.StatusInternalServerError)
		errorResponse := &api.Response{
			ErrorCode: 500,
			Messages:  []string{err.Error()},
		}
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	// If the handler returned a successful response struct, encode it
	if response != nil {
		json.NewEncoder(w).Encode(response)
	}
}
