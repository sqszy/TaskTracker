package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/go-chi/chi/v5"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"

	"github.com/jackc/pgx/v5/pgtype"
	appauth "github.com/sqszy/TaskTracker/internal/auth"
	"github.com/sqszy/TaskTracker/internal/db"
	"github.com/sqszy/TaskTracker/internal/dto"
	"github.com/sqszy/TaskTracker/internal/handlers"
	"github.com/sqszy/TaskTracker/internal/middleware"
	"github.com/sqszy/TaskTracker/tests/mocks"
)

type TaskTestSuite struct {
	suite.Suite
	mockQ   *mocks.MockQuerier
	redis   *miniredis.Miniredis
	rdb     *redis.Client
	authSvc *appauth.Service
	handler *handlers.TaskHandler
	router  *chi.Mux
	userID  int32
	ctx     context.Context
	now     time.Time
}

func (s *TaskTestSuite) SetupTest() {
	s.ctx = context.Background()
	s.now = time.Now()
	s.userID = 33

	mr := miniredis.RunT(s.T())
	s.redis = mr
	s.rdb = redis.NewClient(&redis.Options{Addr: mr.Addr()})
	s.authSvc = appauth.NewService(s.rdb, "acc", "ref", time.Minute, time.Hour)

	s.mockQ = new(mocks.MockQuerier)
	s.handler = handlers.NewTaskHandler(s.mockQ)

	s.router = chi.NewRouter()
	s.router.Use(middleware.AuthMiddleware(s.authSvc))
	s.router.Post("/boards/{boardID}/CreateTask", s.handler.CreateTask)
	s.router.Get("/boards/{boardID}/GetTasks", s.handler.GetTasks)
	s.router.Patch("/boards/{boardID}/tasks/{taskID}", s.handler.PatchTask)
	s.router.Delete("/boards/{boardID}/tasks/{taskID}", s.handler.DeleteTask)
}

func (s *TaskTestSuite) TearDownTest() {
	if s.rdb != nil {
		_ = s.rdb.Close()
	}
	if s.redis != nil {
		s.redis.Close()
	}
}

func (s *TaskTestSuite) TestCreateTask() {
	tp, err := s.authSvc.GenerateTokenPair(s.ctx, s.userID)
	require.NoError(s.T(), err)

	bodyReq := dto.CreateTaskRequest{Title: "Buy milk", Description: "2L"}
	b, _ := json.Marshal(bodyReq)
	req := httptest.NewRequest("POST", "/boards/5/CreateTask", bytes.NewReader(b))
	req.Header.Set("Authorization", "Bearer "+tp.AccessToken)
	w := httptest.NewRecorder()

	createdRow := db.CreateTaskRow{
		ID:          101,
		UserID:      s.userID,
		BoardID:     pgtype.Int4{Int32: 5, Valid: true},
		Title:       "Buy milk",
		Description: pgtype.Text{String: "2L", Valid: true},
		Status:      pgtype.Text{String: "todo", Valid: true},
		Priority:    "medium",
		CreatedAt:   pgtype.Timestamp{Time: s.now, Valid: true},
		UpdatedAt:   pgtype.Timestamp{Time: s.now, Valid: true},
		Deadline:    pgtype.Timestamp{Valid: false},
	}
	s.mockQ.On("CreateTask", mock.Anything, mock.Anything).Return(createdRow, nil)

	s.router.ServeHTTP(w, req)
	require.Equal(s.T(), http.StatusOK, w.Code)

	var got dto.TaskDTO
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &got))
	require.Equal(s.T(), int32(101), got.ID)
	require.Equal(s.T(), "Buy milk", got.Title)

	s.mockQ.AssertExpectations(s.T())
}

func (s *TaskTestSuite) TestGetTasks() {
	tp, err := s.authSvc.GenerateTokenPair(s.ctx, s.userID)
	require.NoError(s.T(), err)

	req := httptest.NewRequest("GET", "/boards/5/GetTasks", nil)
	req.Header.Set("Authorization", "Bearer "+tp.AccessToken)
	w := httptest.NewRecorder()

	row := db.GetTasksRow{
		ID:          201,
		UserID:      s.userID,
		BoardID:     pgtype.Int4{Int32: 5, Valid: true},
		Title:       "Task A",
		Description: pgtype.Text{String: "desc", Valid: true},
		Status:      pgtype.Text{String: "todo", Valid: true},
		Priority:    "high",
		Deadline:    pgtype.Timestamp{Valid: false},
		CreatedAt:   pgtype.Timestamp{Time: s.now, Valid: true},
		UpdatedAt:   pgtype.Timestamp{Time: s.now, Valid: true},
	}

	s.mockQ.On("GetTasks", mock.Anything, mock.Anything).Return([]db.GetTasksRow{row}, nil)

	s.router.ServeHTTP(w, req)
	require.Equal(s.T(), http.StatusOK, w.Code)

	var resp []dto.TaskDTO
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &resp))
	require.Len(s.T(), resp, 1)
	require.Equal(s.T(), "Task A", resp[0].Title)

	s.mockQ.AssertExpectations(s.T())
}

func (s *TaskTestSuite) TestPatchTask() {
	tp, err := s.authSvc.GenerateTokenPair(s.ctx, s.userID)
	require.NoError(s.T(), err)

	update := dto.UpdateTaskRequest{Title: ptrString("New title")}
	b, _ := json.Marshal(update)
	req := httptest.NewRequest("PATCH", "/boards/5/tasks/77", bytes.NewReader(b))
	req.Header.Set("Authorization", "Bearer "+tp.AccessToken)
	w := httptest.NewRecorder()

	mockTask := db.Task{
		ID:          77,
		UserID:      s.userID,
		BoardID:     pgtype.Int4{Int32: 5, Valid: true},
		Title:       "New title",
		Status:      pgtype.Text{String: "todo", Valid: true},
		Description: pgtype.Text{String: "", Valid: false},
		CreatedAt:   pgtype.Timestamp{Time: s.now, Valid: true},
		UpdatedAt:   pgtype.Timestamp{Time: s.now, Valid: true},
	}

	s.mockQ.On("UpdateTask", mock.Anything, mock.Anything).Return(mockTask, nil)

	s.router.ServeHTTP(w, req)
	require.Equal(s.T(), http.StatusOK, w.Code)

	var got dto.TaskDTO
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &got))
	require.Equal(s.T(), int32(77), got.ID)
	require.Equal(s.T(), "New title", got.Title)

	s.mockQ.AssertExpectations(s.T())
}

func (s *TaskTestSuite) TestDeleteTask() {
	tp, err := s.authSvc.GenerateTokenPair(s.ctx, s.userID)
	require.NoError(s.T(), err)

	req := httptest.NewRequest("DELETE", "/boards/5/tasks/9", nil)
	req.Header.Set("Authorization", "Bearer "+tp.AccessToken)
	w := httptest.NewRecorder()

	s.mockQ.On("DeleteTask", mock.Anything, mock.Anything).Return(int64(1), nil)

	s.router.ServeHTTP(w, req)
	require.Equal(s.T(), http.StatusOK, w.Code)

	var res map[string]bool
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &res))
	require.True(s.T(), res["success"])

	s.mockQ.AssertExpectations(s.T())
}

func TestTaskSuite(t *testing.T) {
	suite.Run(t, new(TaskTestSuite))
}

// helper
func ptrString(s string) *string { return &s }
