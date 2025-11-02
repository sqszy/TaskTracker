package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/sqszy/TaskTracker/internal/auth"
	"github.com/sqszy/TaskTracker/internal/db"
	"github.com/sqszy/TaskTracker/internal/dto"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	queries db.Querier
	authSvc *auth.Service
}

func NewAuthHandler(q db.Querier, a *auth.Service) *AuthHandler {
	return &AuthHandler{queries: q, authSvc: a}
}

func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	log.Println("Signup called")

	var req dto.SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	validate := validator.New()
	// Валидация email и пароля
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if err := validate.Struct(req); err != nil {
		log.Println("Validation failed:", err)
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
		log.Println("User already exists:")
		http.Error(w, "user already exists", http.StatusConflict)
		return
	}
	resp := dto.UserDTO{
		ID:    user.ID,
		Email: user.Email,
	}
	log.Println("User signed up:", user.Email)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, "failed to sign up", http.StatusInternalServerError)
		return
	}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	log.Println("Login called")

	var req dto.LoginRequest
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
	resp := dto.LoginResponse{
		AccessToken:  tp.AccessToken,
		RefreshToken: tp.RefreshToken,
		ExpiresIn:    tp.ExpiresIn,
	}
	log.Println("User logged in:", req.Email)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, "failed to log in", http.StatusInternalServerError)
		return
	}
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	log.Println("Refresh called")

	var req dto.RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	tp, err := h.authSvc.Refresh(r.Context(), req.RefreshToken)
	if err != nil {
		http.Error(w, "invalid refresh token", http.StatusUnauthorized)
		return
	}
	log.Println("Refresh done")
	if err := json.NewEncoder(w).Encode(tp); err != nil {
		http.Error(w, "failed to refresh", http.StatusInternalServerError)
		return
	}
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	log.Println("Logout called")

	var req dto.RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	if err := h.authSvc.Revoke(r.Context(), req.RefreshToken); err != nil {
		http.Error(w, "cannot revoke token", http.StatusInternalServerError)
		return
	}
	log.Println("Logout done")
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]bool{"success": true}); err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
}
