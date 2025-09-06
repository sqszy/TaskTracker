package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/sqszy/TaskTracker/internal/auth"
	"github.com/sqszy/TaskTracker/internal/db"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	queries *db.Queries
	authSvc *auth.Service
}

func NewAuthHandler(q *db.Queries, a *auth.Service) *AuthHandler {
	return &AuthHandler{queries: q, authSvc: a}
}

type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignupResponse struct {
	ID    int32  `json:"id"`
	Email string `json:"email"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || len(req.Password) < 6 {
		http.Error(w, "invalid email or password too short", http.StatusBadRequest)
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	user, err := h.queries.CreateUser(r.Context(), db.CreateUserParams{
		Email:    req.Email,
		Password: string(hash),
	})
	if err != nil {
		http.Error(w, "user already exists", http.StatusConflict)
		return
	}
	resp := SignupResponse{ID: user.ID, Email: user.Email}
	json.NewEncoder(w).Encode(resp)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	user, err := h.queries.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		http.Error(w, "invalid email or password", http.StatusUnauthorized)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "invalid email or password", http.StatusUnauthorized)
		return
	}
	tp, err := h.authSvc.GenerateTokenPair(r.Context(), user.ID)
	if err != nil {
		http.Error(w, "cannot generate token", http.StatusInternalServerError)
		return
	}
	resp := LoginResponse{AccessToken: tp.AccessToken, RefreshToken: tp.RefreshToken, ExpiresIn: tp.ExpiresIn}
	json.NewEncoder(w).Encode(resp)
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	tp, err := h.authSvc.Refresh(r.Context(), req.RefreshToken)
	if err != nil {
		http.Error(w, "invalid refresh token", http.StatusUnauthorized)
		return
	}
	json.NewEncoder(w).Encode(tp)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	if err := h.authSvc.Revoke(r.Context(), req.RefreshToken); err != nil {
		http.Error(w, "cannot revoke token", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
