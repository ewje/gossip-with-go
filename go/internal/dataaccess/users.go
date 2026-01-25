package dataaccess

import (
	"context"
	"fmt"

	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
)

func CreateUser(db *database.Database, u models.User) (models.User, error) {
	sql := `INSERT INTO users (username) VALUES ($1) RETURNING id`
	err := db.Pool.QueryRow(context.Background(), sql, u.Username).Scan(&u.ID)
	return u, err
}

func GetUserByUsername(db *database.Database, username string) (models.User, error) {
	var u models.User
	sql := `SELECT id, username FROM users WHERE username = $1`

	err := db.Pool.QueryRow(context.Background(), sql, username).Scan(&u.ID, &u.Username)
	if err != nil {
		return u, err
	}
	return u, nil
}

func ListUsers(db *database.Database) ([]models.User, error) {
	rows, err := db.Pool.Query(context.Background(), "SELECT id, username FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Username); err != nil {
			fmt.Println("Error scanning users:", err)
			continue
		}
		users = append(users, u)
	}
	return users, nil
}
