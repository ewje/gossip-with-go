package dataaccess

import (
	"context"

	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
)

func CreateUser(db *database.Database, u models.User) (models.User, error) {
	sql := `INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id`
	err := db.Pool.QueryRow(context.Background(), sql, u.Username, u.Email).Scan(&u.ID)
	return u, err
}

func GetUserByUsername(db *database.Database, username string) (models.User, error) {
	var u models.User
	// 1. The Recipe: Find user by name
	sql := `SELECT id, username, email FROM users WHERE username = $1`

	// 2. The Cooking
	err := db.Pool.QueryRow(context.Background(), sql, username).Scan(&u.ID, &u.Username, &u.Email)
	if err != nil {
		return u, err
	}
	return u, nil
}
