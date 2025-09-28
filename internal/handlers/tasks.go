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

// POST /boards/{boardID}/CreateTask
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

	// defaults
	status := req.Status
	if status == "" {
		status = "todo"
	}
	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}

	var deadline pgtype.Timestamp
	if req.Deadline != nil {
		deadline = pgtype.Timestamp{Time: *req.Deadline, Valid: true}
	}

	task, err := h.queries.CreateTask(r.Context(), db.CreateTaskParams{
		BoardID:     pgtype.Int4{Int32: int32(boardID), Valid: true},
		UserID:      int32(userID),
		Title:       req.Title,
		Description: pgtype.Text{String: req.Description, Valid: req.Description != ""},
		Status:      pgtype.Text{String: status, Valid: true},
		Priority:    priority,
		Deadline:    deadline,
	})
	if err != nil {
		http.Error(w, "cannot create task", http.StatusInternalServerError)
		log.Println("cannot create task:", err)
		return
	}

	resp := dto.TaskDTO{
		ID:          task.ID,
		BoardID:     task.BoardID.Int32,
		UserID:      task.UserID,
		Title:       task.Title,
		Description: task.Description.String,
		Status:      task.Status.String,
		Priority:    task.Priority,
		CreatedAt:   task.CreatedAt.Time,
		UpdatedAt:   task.UpdatedAt.Time,
	}
	if task.Deadline.Valid {
		resp.Deadline = &task.Deadline.Time
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
			Status:      t.Status.String,
			Priority:    t.Priority,
			Deadline:    &t.Deadline.Time,
			CreatedAt:   t.CreatedAt.Time,
			UpdatedAt:   t.UpdatedAt.Time,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[GetTasks] done")
	_ = json.NewEncoder(w).Encode(resp)
}

// PATCH /boards/{boardID}/tasks/{taskID}
func (h *TaskHandler) PatchTask(w http.ResponseWriter, r *http.Request) {
	boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
	if err != nil {
		http.Error(w, "invalid board id", http.StatusBadRequest)
		return
	}

	taskID, err := strconv.Atoi(chi.URLParam(r, "taskID"))
	if err != nil {
		http.Error(w, "invalid task id", http.StatusBadRequest)
		return
	}

	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req dto.UpdateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	params := db.UpdateTaskParams{
		ID:      int32(taskID),
		BoardID: pgtype.Int4{Int32: int32(boardID), Valid: true},
		UserID:  int32(userID),
	}

	if req.Title != nil {
		params.Title = pgtype.Text{String: *req.Title, Valid: true}
	}
	if req.Description != nil {
		params.Description = pgtype.Text{String: *req.Description, Valid: true}
	}
	if req.Status != nil {
		params.Status = pgtype.Text{String: *req.Status, Valid: true}
	}
	if req.Priority != nil {
		params.Priority = pgtype.Text{String: *req.Priority, Valid: true}
	}
	if req.Deadline != nil {
		params.Deadline = pgtype.Timestamp{Time: *req.Deadline, Valid: true}
	}

	task, err := h.queries.UpdateTask(r.Context(), params)
	if err != nil {
		http.Error(w, "cannot update task", http.StatusInternalServerError)
		log.Println("cannot update task:", err)
		return
	}

	resp := dto.TaskDTO{
		ID:          task.ID,
		BoardID:     task.BoardID.Int32,
		UserID:      task.UserID,
		Title:       task.Title,
		Description: task.Description.String,
		Status:      task.Status.String,
		Priority:    task.Priority,
		CreatedAt:   task.CreatedAt.Time,
		UpdatedAt:   task.UpdatedAt.Time,
	}
	if task.Deadline.Valid {
		resp.Deadline = &task.Deadline.Time
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[PatchTask] is updated task:", task.ID)
	_ = json.NewEncoder(w).Encode(resp)
}

// DELETE /boards/{boardID}/tasks/{taskID}
func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
	if err != nil {
		http.Error(w, "invalid board id", http.StatusBadRequest)
		return
	}

	taskID, err := strconv.Atoi(chi.URLParam(r, "taskID"))
	if err != nil {
		http.Error(w, "invalid task id", http.StatusBadRequest)
		return
	}

	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.queries.DeleteTask(r.Context(), db.DeleteTaskParams{
		ID:      int32(taskID),
		BoardID: pgtype.Int4{Int32: int32(boardID), Valid: true},
		UserID:  int32(userID),
	})
	if err != nil {
		http.Error(w, "cannot delete task", http.StatusInternalServerError)
		return
	}

	if rows == 0 {
		http.Error(w, "task not found or not yours", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	log.Println("[DeleteTask] done for taskID:", taskID)
	_ = json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
