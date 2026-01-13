package dataaccess

import (
	"context"
	"fmt"

	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
)

func ListCommentsByPost(db *database.Database, postID string) ([]models.Comment, error) {
	sql := `SELECT * FROM comments WHERE post_id = $1`
	rows, err := db.Pool.Query(context.Background(), sql, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []models.Comment{}
	for rows.Next() {
		var c models.Comment
		rows.Scan(&c.ID, &c.PostID, &c.UserID, &c.Content, &c.CreatedAt)
		comments = append(comments, c)
	}
	return comments, nil
}

func UpdateComment(db *database.Database, c models.Comment) (models.Comment, error) {
	sql := `UPDATE comments SET content = $1 WHERE id = $2`

	tag, err := db.Pool.Exec(context.Background(), sql, c.Content, c.ID)
	if err != nil {
		return c, err
	}

	if tag.RowsAffected() == 0 {
		return c, fmt.Errorf("Comment not found")
	}

	return c, nil
}

func DeleteComment(db *database.Database, id int) error {
	sql := `DELETE FROM comments WHERE id = $1`

	tag, err := db.Pool.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return fmt.Errorf("Comment not found")
	}

	return nil
}

func CreateComment(db *database.Database, c models.Comment) (models.Comment, error) {
	sql := `INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, created_at`
	err := db.Pool.QueryRow(context.Background(), sql, c.PostID, c.UserID, c.Content).Scan(&c.ID, &c.CreatedAt)
	return c, err
}
