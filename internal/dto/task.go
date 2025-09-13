package dto

import "time"

type TaskDTO struct {
	ID          int32     `json:"id"`
	BoardID     int32     `json:"board_id"`
	UserID      int32     `json:"user_id"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateTaskRequest struct {
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
}
