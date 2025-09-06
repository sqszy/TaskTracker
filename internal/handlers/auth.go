package handlers

import (
	//"context"
	// "time"
	"encoding/json"
	"net/http"

	"github.com/sqszy/TaskTracker/internal/db"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	queries *db.Queries
}

func NewAuthHandler(q *db.Queries) *AuthHandler {
	return &AuthHandler{queries: q}
}

type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignupResponse struct {
	ID    int32  `json:"id"`
	Email string `json:"email"`
}

func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Проверяем длину пароля
	if len(req.Password) < 6 {
		http.Error(w, "password too short", http.StatusBadRequest)
		return
	}

	// Хэшируем пароль
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	// Создаём пользователя в базе
	user, err := h.queries.CreateUser(r.Context(), db.CreateUserParams{
		Email:    req.Email,
		Password: string(hash),
	})
	if err != nil {
		http.Error(w, "user already exists", http.StatusConflict)
		return
	}

	resp := SignupResponse{
		ID:    user.ID,
		Email: user.Email,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
