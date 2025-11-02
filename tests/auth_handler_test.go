package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"golang.org/x/crypto/bcrypt"

	appauth "github.com/sqszy/TaskTracker/internal/auth"
	"github.com/sqszy/TaskTracker/internal/db"
	"github.com/sqszy/TaskTracker/internal/dto"
	"github.com/sqszy/TaskTracker/internal/handlers"
	"github.com/sqszy/TaskTracker/tests/mocks"
)

type AuthTestSuite struct {
	suite.Suite
	mockQ   *mocks.MockQuerier
	redis   *miniredis.Miniredis
	rdb     *redis.Client
	authSvc *appauth.Service
	handler *handlers.AuthHandler
	ctx     context.Context
}

func (s *AuthTestSuite) SetupTest() {
	s.ctx = context.Background()
	mr := miniredis.RunT(s.T())
	s.redis = mr
	s.rdb = redis.NewClient(&redis.Options{Addr: mr.Addr()})

	s.authSvc = appauth.NewService(s.rdb, "access-secret", "refresh-secret", time.Minute, time.Hour*24)
	s.mockQ = new(mocks.MockQuerier)
	s.handler = handlers.NewAuthHandler(s.mockQ, s.authSvc)
}

func (s *AuthTestSuite) TearDownTest() {
	if s.rdb != nil {
		_ = s.rdb.Close()
	}
	if s.redis != nil {
		s.redis.Close()
	}
}

func (s *AuthTestSuite) TestSignupSuccess() {
	reqBody := dto.SignupRequest{Email: "user@example.com", Password: "123456"}
	b, _ := json.Marshal(reqBody)

	createdRow := db.CreateUserRow{
		ID:       7,
		Email:    "user@example.com",
		Password: "hashed",
	}

	// мокируем CreateUser -> CreateUserRow
	s.mockQ.On("CreateUser", mock.Anything, mock.Anything).Return(createdRow, nil)

	req := httptest.NewRequest("POST", "/signup", bytes.NewReader(b))
	w := httptest.NewRecorder()

	s.handler.Signup(w, req)

	require.Equal(s.T(), http.StatusOK, w.Code)
	var got dto.UserDTO
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &got))
	require.Equal(s.T(), int32(7), got.ID)
	require.Equal(s.T(), "user@example.com", got.Email)

	s.mockQ.AssertExpectations(s.T())
}

func (s *AuthTestSuite) TestSignupConflict() {
	reqBody := dto.SignupRequest{Email: "exists@example.com", Password: "123456"}
	b, _ := json.Marshal(reqBody)

	s.mockQ.On("CreateUser", mock.Anything, mock.Anything).Return(db.CreateUserRow{}, errors.New("unique_violation"))

	req := httptest.NewRequest("POST", "/signup", bytes.NewReader(b))
	w := httptest.NewRecorder()

	s.handler.Signup(w, req)

	require.Equal(s.T(), http.StatusConflict, w.Code)
	s.mockQ.AssertExpectations(s.T())
}

func (s *AuthTestSuite) TestLoginSuccess() {
	pass := "mypassword"
	hash, _ := bcrypt.GenerateFromPassword([]byte(pass), bcrypt.DefaultCost)

	userRow := db.GetUserByEmailRow{
		ID:       11,
		Email:    "me@ex.com",
		Password: string(hash),
	}

	s.mockQ.On("GetUserByEmail", mock.Anything, "me@ex.com").Return(userRow, nil)

	loginReq := dto.LoginRequest{Email: "me@ex.com", Password: pass}
	b, _ := json.Marshal(loginReq)

	req := httptest.NewRequest("POST", "/login", bytes.NewReader(b))
	w := httptest.NewRecorder()

	s.handler.Login(w, req)

	require.Equal(s.T(), http.StatusOK, w.Code)
	var resp dto.LoginResponse
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &resp))
	require.NotEmpty(s.T(), resp.AccessToken)
	require.NotEmpty(s.T(), resp.RefreshToken)

	s.mockQ.AssertExpectations(s.T())
}

func (s *AuthTestSuite) TestLoginWrongPassword() {
	pass := "rightpass"
	hash, _ := bcrypt.GenerateFromPassword([]byte(pass), bcrypt.DefaultCost)

	userRow := db.GetUserByEmailRow{
		ID:       12,
		Email:    "bob@ex.com",
		Password: string(hash),
	}

	s.mockQ.On("GetUserByEmail", mock.Anything, "bob@ex.com").Return(userRow, nil)

	loginReq := dto.LoginRequest{Email: "bob@ex.com", Password: "wrong"}
	b, _ := json.Marshal(loginReq)

	req := httptest.NewRequest("POST", "/login", bytes.NewReader(b))
	w := httptest.NewRecorder()

	s.handler.Login(w, req)

	require.Equal(s.T(), http.StatusUnauthorized, w.Code)
	s.mockQ.AssertExpectations(s.T())
}

func (s *AuthTestSuite) TestRefreshAndLogout() {
	tp, err := s.authSvc.GenerateTokenPair(s.ctx, 42)
	require.NoError(s.T(), err)

	// Refresh
	body, _ := json.Marshal(dto.RefreshRequest{RefreshToken: tp.RefreshToken})
	req := httptest.NewRequest("POST", "/refresh", bytes.NewReader(body))
	w := httptest.NewRecorder()

	s.handler.Refresh(w, req)
	require.Equal(s.T(), http.StatusOK, w.Code)
	var newTP dto.LoginResponse
	require.NoError(s.T(), json.Unmarshal(w.Body.Bytes(), &newTP))
	require.NotEmpty(s.T(), newTP.AccessToken)

	// Logout (revoke)
	body2, _ := json.Marshal(dto.RefreshRequest{RefreshToken: tp.RefreshToken})
	req2 := httptest.NewRequest("POST", "/logout", bytes.NewReader(body2))
	w2 := httptest.NewRecorder()

	s.handler.Logout(w2, req2)
	require.Equal(s.T(), http.StatusOK, w2.Code)
	var res map[string]bool
	require.NoError(s.T(), json.Unmarshal(w2.Body.Bytes(), &res))
	require.True(s.T(), res["success"])
}

func TestAuthSuite(t *testing.T) {
	suite.Run(t, new(AuthTestSuite))
}
