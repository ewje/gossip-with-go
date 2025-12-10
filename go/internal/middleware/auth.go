package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/ewje/gossip-with-go/internal/api"
)

// Define a special key type so other code can't accidentally overwrite it
type key int

const UserIDKey key = 0

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Check for the "Authorization" header
		// The user should send: "Authorization: 42"
		tokenString := r.Header.Get("Authorization")

		if tokenString == "" {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(api.Response{Messages: []string{"Missing Authorization header"}})
			return
		}

		// 2. Verify the token (in our simple case, it's just the ID number)
		userID, err := strconv.Atoi(tokenString)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(api.Response{Messages: []string{"Invalid token format"}})
			return
		}

		// 3. Store the User ID in the Request Context (The Pocket)
		// context is a bag of data that travels with the request
		ctx := context.WithValue(r.Context(), UserIDKey, userID)

		// 4. Let them pass, carrying the context
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
