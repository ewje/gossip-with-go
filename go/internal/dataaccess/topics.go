package dataaccess

import (
	"context"
	"fmt"

	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/models"
)

func ListTopics(db *database.Database) ([]models.Topic, error) {
	rows, err := db.Pool.Query(context.Background(), "SELECT * FROM topics")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	topics := []models.Topic{}
	for rows.Next() {
		var t models.Topic
		if err := rows.Scan(&t.ID, &t.Name, &t.Description, &t.UserID); err != nil {
			fmt.Println("Error scanning topic:", err)
			continue
		}
		topics = append(topics, t)
	}
	return topics, nil
}

func FetchTopic(db *database.Database, id int) (models.Topic, error) {
	sql := `SELECT * FROM topics WHERE id = $1`
	var t models.Topic

	err := db.Pool.QueryRow(context.Background(), sql, id).Scan(&t.ID, &t.Name, &t.Description, &t.UserID)
	if err != nil {
		return t, err
	}

	return t, nil
}

func UpdateTopic(db *database.Database, t models.Topic) (models.Topic, error) {
	sql := `UPDATE topics SET name = $1 WHERE id = $2`

	tag, err := db.Pool.Exec(context.Background(), sql, t.Name, t.ID)
	if err != nil {
		return t, err
	}

	if tag.RowsAffected() == 0 {
		return t, fmt.Errorf("Topic not found")
	}

	return t, nil
}

func DeleteTopic(db *database.Database, id int) error {
	sql := `DELETE FROM topics WHERE id = $1`

	tag, err := db.Pool.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return fmt.Errorf("Topic not found")
	}

	return nil
}

func CreateTopic(db *database.Database, t models.Topic) (models.Topic, error) {
	sql := `INSERT INTO topics (name, description, user_id) VALUES ($1, $2, $3) RETURNING id`
	err := db.Pool.QueryRow(context.Background(), sql, t.Name, t.Description, t.UserID).Scan(&t.ID)
	return t, err
}
