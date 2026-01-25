package dataaccess

import (
	"context"
	"fmt"

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

func FetchPost(db *database.Database, id int) (models.Post, error) {
	sql := `SELECT * FROM posts WHERE id = $1`
	var p models.Post

	err := db.Pool.QueryRow(context.Background(), sql, id).Scan(&p.ID, &p.UserID, &p.TopicID, &p.Title, &p.Content, &p.CreatedAt)
	if err != nil {
		return p, err
	}

	return p, nil
}

func UpdatePost(db *database.Database, p models.Post) (models.Post, error) {
	sql := `UPDATE posts SET title = $1, content = $2 WHERE id = $3`

	// We use Exec() because we don't need to get any data back, just a confirmation
	tag, err := db.Pool.Exec(context.Background(), sql, p.Title, p.Content, p.ID)
	if err != nil {
		return p, err
	}

	// 3. The Check: Did we actually find a post to update?
	if tag.RowsAffected() == 0 {
		return p, fmt.Errorf("Post not found")
	}

	return p, nil
}

func DeletePost(db *database.Database, id int) error {
	sql := `DELETE FROM posts WHERE id = $1`

	tag, err := db.Pool.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return fmt.Errorf("Post not found")
	}

	return nil
}

func CreatePost(db *database.Database, p models.Post) (models.Post, error) {
	sql := `INSERT INTO posts (topic_id, user_id, title, content) VALUES ($1, $2, $3, $4) RETURNING id, created_at`
	err := db.Pool.QueryRow(context.Background(), sql, p.TopicID, p.UserID, p.Title, p.Content).Scan(&p.ID, &p.CreatedAt)
	return p, err
}
