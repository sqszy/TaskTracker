package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/sqszy/TaskTracker/internal/db"
	"github.com/sqszy/TaskTracker/internal/dto"
	"github.com/sqszy/TaskTracker/internal/middleware"
)

type BoardHandler struct {
	queries db.Querier
}

func NewBoardHandler(q db.Querier) *BoardHandler {
	return &BoardHandler{queries: q}
}

// POST /CreateBoard
func (h *BoardHandler) CreateBoard(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateBoardRequest
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
		log.Println("cannot create board", err)
		return
	}

	resp := dto.BoardDTO{
		ID:        board.ID,
		UserID:    board.UserID,
		Name:      board.Name,
		CreatedAt: board.CreatedAt.Time,
		UpdatedAt: board.UpdatedAt.Time,
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[CreateBoard] board created:", board.ID, "by user", userID)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
}

// GET /GetBoards
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

	var resp []dto.BoardDTO
	for _, b := range boards {
		resp = append(resp, dto.BoardDTO{
			ID:        b.ID,
			UserID:    b.UserID,
			Name:      b.Name,
			CreatedAt: b.CreatedAt.Time,
			UpdatedAt: b.UpdatedAt.Time,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[GetBoard] by user", userID)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
}

// PATCH boards/{boardID}
func (h *BoardHandler) PatchBoard(w http.ResponseWriter, r *http.Request) {
	boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
	if err != nil {
		http.Error(w, "invalid boardID", http.StatusBadRequest)
		return
	}

	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req dto.UpdateBoardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	params := db.UpdateBoardParams{
		ID:     int32(boardID),
		UserID: int32(userID),
	}

	if req.Name != nil {
		params.Name = pgtype.Text{String: *req.Name, Valid: true}
	}

	board, err := h.queries.UpdateBoard(r.Context(), params)
	if err != nil {
		http.Error(w, "cannot update board (maybe not yours?)", http.StatusForbidden)
		log.Println("cannot update board:", err)
		return
	}

	resp := dto.BoardDTO{
		ID:        board.ID,
		UserID:    board.UserID,
		Name:      board.Name,
		CreatedAt: board.CreatedAt.Time,
		UpdatedAt: board.UpdatedAt.Time,
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[PatchBoard] updated board:", board.ID)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
}

// DELETE /boards/{boardID}
func (h *BoardHandler) DeleteBoard(w http.ResponseWriter, r *http.Request) {
	boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
	if err != nil {
		http.Error(w, "invalid boardID", http.StatusBadRequest)
		return
	}

	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.queries.DeleteBoard(r.Context(), db.DeleteBoardParams{
		ID:     int32(boardID),
		UserID: int32(userID),
	})
	if err != nil {
		http.Error(w, "cannot delete board", http.StatusInternalServerError)
		log.Println("delete board error:", err)
		return
	}
	if rows == 0 {
		http.Error(w, "board not found or not yours", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[DeleteBoard] deleted board:", boardID)
	if err := json.NewEncoder(w).Encode(map[string]bool{"success": true}); err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
}
