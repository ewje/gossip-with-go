package dataaccess

import (
	"context"
	"fmt"

	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
)

func ListTopics(db *database.Database) ([]models.Topic, error) {
	rows, err := db.Pool.Query(context.Background(), "SELECT id, name, user_id FROM topics")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	topics := []models.Topic{}
	for rows.Next() {
		var t models.Topic
		if err := rows.Scan(&t.ID, &t.Name, &t.UserID); err != nil {
			continue
		}
		topics = append(topics, t)
	}
	return topics, nil
}

func UpdateTopic(db *database.Database, t models.Topic) (models.Topic, error) {
	// 1. The Recipe: Update title and content where the ID matches
	sql := `UPDATE topics SET name = $1 WHERE id = $2`

	// 2. The Cooking: Run the command
	// We use Exec() because we don't need to get any data back, just a confirmation
	tag, err := db.Pool.Exec(context.Background(), sql, t.Name, t.ID)
	if err != nil {
		return t, err
	}

	// 3. The Check: Did we actually find a post to update?
	if tag.RowsAffected() == 0 {
		return t, fmt.Errorf("Topic not found")
	}

	return t, nil
}

func DeleteTopic(db *database.Database, id int) error {
	// 1. The Recipe: Delete the post with this specific ID
	sql := `DELETE FROM topics WHERE id = $1`

	// 2. The Cooking: Run the command
	tag, err := db.Pool.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	// 3. The Check: Did we actually find a post to delete?
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("Topic not found")
	}

	return nil
}

func CreateTopic(db *database.Database, t models.Topic) (models.Topic, error) {
	sql := `INSERT INTO topics (name, user_id) VALUES ($1, $2) RETURNING id`
	err := db.Pool.QueryRow(context.Background(), sql, t.Name, t.UserID).Scan(&t.ID)
	return t, err
}
