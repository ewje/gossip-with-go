package dataaccess

import (
	"context"

	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
)

func ListTopics(db *database.Database) ([]models.Topic, error) {
	rows, err := db.Pool.Query(context.Background(), "SELECT id, name FROM topics")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	topics := []models.Topic{}
	for rows.Next() {
		var t models.Topic
		if err := rows.Scan(&t.ID, &t.Name); err != nil {
			continue
		}
		topics = append(topics, t)
	}
	return topics, nil
}

func CreateTopic(db *database.Database, t models.Topic) (models.Topic, error) {
	sql := `INSERT INTO topics (name) VALUES ($1) RETURNING id`
	err := db.Pool.QueryRow(context.Background(), sql, t.Name).Scan(&t.ID)
	return t, err
}
