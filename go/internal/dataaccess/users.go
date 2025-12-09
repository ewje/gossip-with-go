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
