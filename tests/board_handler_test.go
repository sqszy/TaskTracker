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

type BoardTestSuite struct {
	suite.Suite
	mockQ   *mocks.MockQuerier
	redis   *miniredis.Miniredis
	rdb     *redis.Client
	authSvc *appauth.Service
	handler *handlers.BoardHandler
	router  *chi.Mux
	userID  int32
	now     time.Time
	ctx     context.Context
}

func (s *BoardTestSuite) SetupTest() {
	s.ctx = context.Background()
	s.now = time.Now()
	s.userID = 5

	mr := miniredis.RunT(s.T())
	s.redis = mr
	s.rdb = redis.NewClient(&redis.Options{Addr: mr.Addr()})
	s.authSvc = appauth.NewService(s.rdb, "acc", "ref", time.Minute, time.Hour)

	s.mockQ = new(mocks.MockQuerier)
	s.handler = handlers.NewBoardHandler(s.mockQ)

	s.router = chi.NewRouter()
	s.router.Use(middleware.AuthMiddleware(s.authSvc))
	s.router.Post("/CreateBoard", s.handler.CreateBoard)
	s.router.Get("/GetBoards", s.handler.GetBoards)
	s.router.Patch("/boards/{boardID}", s.handler.PatchBoard)
	s.router.Delete("/boards/{boardID}", s.handler.DeleteBoard)
}

func (s *BoardTestSuite) TearDownTest() {
	if s.rdb != nil {
		_ = s.rdb.Close()
	}
	if s.redis != nil {
		s.redis.Close()
	}
}

func (s *BoardTestSuite) TestCreateBoard() {
	tp, err := s.authSvc.GenerateTokenPair(s.ctx, s.userID)
	require.NoError(s.T(), err)

	reqBody := dto.CreateBoardRequest{Name: "MyBoard"}
	b, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/CreateBoard", bytes.NewReader(b))
	req.Header.Set("Authorization", "Bearer "+tp.AccessToken)
	w := httptest.NewRecorder()

	mockBoard := db.Board{
		ID:     77,
		UserID: s.userID,
		Name:   "MyBoard",
		CreatedAt: pgtype.Timestamp{
			Time:  s.now,
			Valid: true,
		},
		UpdatedAt: pgtype.Timestamp{
			Time:  s.now,
			Valid: true,
		},
	}
	s.mockQ.On("CreateBoard", mock.Anything, mock.Anything).Return(mockBoard, nil)

	s.router.ServeHTTP(w, req)

	require.Equal(s.T(), http.StatusOK, w.Code)
	var got dto.BoardDTO
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &got))
	require.Equal(s.T(), int32(77), got.ID)
	require.Equal(s.T(), "MyBoard", got.Name)

	s.mockQ.AssertExpectations(s.T())
}

func (s *BoardTestSuite) TestGetBoards() {
	tp, err := s.authSvc.GenerateTokenPair(s.ctx, s.userID)
	require.NoError(s.T(), err)

	req := httptest.NewRequest("GET", "/GetBoards", nil)
	req.Header.Set("Authorization", "Bearer "+tp.AccessToken)
	w := httptest.NewRecorder()

	mockB := db.Board{
		ID:     1,
		UserID: s.userID,
		Name:   "B1",
		CreatedAt: pgtype.Timestamp{
			Time:  s.now,
			Valid: true,
		},
		UpdatedAt: pgtype.Timestamp{
			Time:  s.now,
			Valid: true,
		},
	}
	s.mockQ.On("GetBoards", mock.Anything, s.userID).Return([]db.Board{mockB}, nil)

	s.router.ServeHTTP(w, req)

	require.Equal(s.T(), http.StatusOK, w.Code)
	var resp []dto.BoardDTO
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &resp))
	require.Len(s.T(), resp, 1)
	require.Equal(s.T(), "B1", resp[0].Name)

	s.mockQ.AssertExpectations(s.T())
}

func (s *BoardTestSuite) TestPatchBoard() {
	tp, err := s.authSvc.GenerateTokenPair(s.ctx, s.userID)
	require.NoError(s.T(), err)

	body := map[string]string{"name": "Renamed"}
	b, _ := json.Marshal(body)
	req := httptest.NewRequest("PATCH", "/boards/42", bytes.NewReader(b))
	req.Header.Set("Authorization", "Bearer "+tp.AccessToken)
	w := httptest.NewRecorder()

	mockB := db.Board{
		ID:     42,
		UserID: s.userID,
		Name:   "Renamed",
		CreatedAt: pgtype.Timestamp{
			Time:  s.now,
			Valid: true,
		},
		UpdatedAt: pgtype.Timestamp{
			Time:  s.now,
			Valid: true,
		},
	}
	s.mockQ.On("UpdateBoard", mock.Anything, mock.Anything).Return(mockB, nil)

	s.router.ServeHTTP(w, req)

	require.Equal(s.T(), http.StatusOK, w.Code)
	var got dto.BoardDTO
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &got))
	require.Equal(s.T(), int32(42), got.ID)
	require.Equal(s.T(), "Renamed", got.Name)

	s.mockQ.AssertExpectations(s.T())
}

func (s *BoardTestSuite) TestDeleteBoard() {
	tp, err := s.authSvc.GenerateTokenPair(s.ctx, s.userID)
	require.NoError(s.T(), err)

	req := httptest.NewRequest("DELETE", "/boards/99", nil)
	req.Header.Set("Authorization", "Bearer "+tp.AccessToken)
	w := httptest.NewRecorder()

	s.mockQ.On("DeleteBoard", mock.Anything, mock.Anything).Return(int64(1), nil)

	s.router.ServeHTTP(w, req)

	require.Equal(s.T(), http.StatusOK, w.Code)
	var res map[string]bool
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &res))
	require.True(s.T(), res["success"])

	s.mockQ.AssertExpectations(s.T())
}

func TestBoardSuite(t *testing.T) {
	suite.Run(t, new(BoardTestSuite))
}
