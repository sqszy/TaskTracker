package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/sqszy/TaskTracker/internal/db"
	"github.com/sqszy/TaskTracker/internal/middleware"
)

type BoardHandler struct {
	queries *db.Queries
}

func NewBoardHandler(q *db.Queries) *BoardHandler {
	return &BoardHandler{queries: q}
}

type CreateBoardRequest struct {
	Name string `json:"name"`
}

func (h *BoardHandler) CreateBoard(w http.ResponseWriter, r *http.Request) {
	var req CreateBoardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	board, err := h.queries.CreateBoard(r.Context(), db.CreateBoardParams{
		Name:   req.Name,
		UserID: userID,
	})
	if err != nil {
		http.Error(w, "cannot create board", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[CreateBoard] board created:", board.ID, "by user", userID)
	json.NewEncoder(w).Encode(board)
}

func (h *BoardHandler) GetBoards(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	boards, err := h.queries.GetBoards(r.Context(), userID)
	if err != nil {
		http.Error(w, "cannot fetch boards", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[GetBoard] by user", userID)
	json.NewEncoder(w).Encode(boards)
}
