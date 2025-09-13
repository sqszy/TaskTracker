package dto

import "time"

type BoardDTO struct {
	ID        int32     `json:"id"`
	UserID    int32     `json:"user_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateBoardRequest struct {
	Name string `json:"name"`
}
