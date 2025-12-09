package models

import "time"

type Post struct {
	ID        int       `json:"id"`
	TopicID   int       `json:"topic_id"`
	UserID    int       `json:"user_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}
