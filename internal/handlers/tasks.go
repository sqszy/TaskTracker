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

type TaskHandler struct {
	queries *db.Queries
}

func NewTaskHandler(q *db.Queries) *TaskHandler {
	return &TaskHandler{queries: q}
}

// POST /boards/{boardID}/tasks
func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	boardIDStr := chi.URLParam(r, "boardID")
	boardID, err := strconv.Atoi(boardIDStr)
	if err != nil {
		http.Error(w, "invalid board id", http.StatusBadRequest)
		return
	}

	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req dto.CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Title == "" {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	task, err := h.queries.CreateTask(r.Context(), db.CreateTaskParams{
		BoardID:     pgtype.Int4{Int32: int32(boardID), Valid: true},
		UserID:      int32(userID),
		Title:       req.Title,
		Description: pgtype.Text{String: req.Description, Valid: true},
	})
	if err != nil {
		http.Error(w, "cannot create task", http.StatusInternalServerError)
		return
	}

	resp := dto.TaskDTO{
		ID:          task.ID,
		BoardID:     task.BoardID.Int32,
		UserID:      task.UserID,
		Title:       task.Title,
		Description: task.Description.String,
		CreatedAt:   task.CreatedAt.Time,
		UpdatedAt:   task.UpdatedAt.Time,
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[CreateTask] task created:", task.ID, "in board", boardID, "by user", userID)
	_ = json.NewEncoder(w).Encode(resp)
}

// GET /boards/{boardID}/tasks
func (h *TaskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
	boardIDStr := chi.URLParam(r, "boardID")
	boardID, err := strconv.Atoi(boardIDStr)
	if err != nil {
		http.Error(w, "invalid board id", http.StatusBadRequest)
		return
	}

	tasks, err := h.queries.GetTasks(r.Context(), pgtype.Int4{Int32: int32(boardID), Valid: true})
	if err != nil {
		http.Error(w, "cannot fetch tasks", http.StatusInternalServerError)
		return
	}

	var resp []dto.TaskDTO
	for _, t := range tasks {
		resp = append(resp, dto.TaskDTO{
			ID:          t.ID,
			BoardID:     t.BoardID.Int32,
			UserID:      t.UserID,
			Title:       t.Title,
			Description: t.Description.String,
			CreatedAt:   t.CreatedAt.Time,
			UpdatedAt:   t.UpdatedAt.Time,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[GetTasks] done")
	_ = json.NewEncoder(w).Encode(resp)
}
