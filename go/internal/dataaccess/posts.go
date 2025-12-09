package dataaccess

import (
	"context"

	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
)

func ListPostsByTopic(db *database.Database, topicID string) ([]models.Post, error) {
	sql := `SELECT id, topic_id, user_id, title, content, created_at FROM posts WHERE topic_id = $1`
	rows, err := db.Pool.Query(context.Background(), sql, topicID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	posts := []models.Post{}
	for rows.Next() {
		var p models.Post
		rows.Scan(&p.ID, &p.TopicID, &p.UserID, &p.Title, &p.Content, &p.CreatedAt)
		posts = append(posts, p)
	}
	return posts, nil
}

func CreatePost(db *database.Database, p models.Post) (models.Post, error) {
	sql := `INSERT INTO posts (topic_id, user_id, title, content) VALUES ($1, $2, $3, $4) RETURNING id, created_at`
	err := db.Pool.QueryRow(context.Background(), sql, p.TopicID, p.UserID, p.Title, p.Content).Scan(&p.ID, &p.CreatedAt)
	return p, err
}
