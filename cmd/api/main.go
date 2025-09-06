package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/sqszy/TaskTracker/db"
	"github.com/sqszy/TaskTracker/internal/handlers"
)

type Health struct {
	Status string `json:"status"`
	DB     string `json:"db"`
}

func main() {
	_ = godotenv.Load()

	port := env("PORT", "8080")
	dbURL := env("DB_URL", "postgres://app:secret@localhost:5432/tasktracker?sslmode=disable")

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	dbpool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("pg connect error: %v", err)
	}
	defer dbpool.Close()

	if err := dbpool.Ping(ctx); err != nil {
		log.Fatalf("pg ping error: %v", err)
	}

	queries := db.New(dbpool)

	r := chi.NewRouter()
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		h := Health{Status: "ok", DB: "up"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(h)
	})

	authHandler := handlers.NewAuthHandler(queries)
	r.Post("/signup", authHandler.Signup)

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("backend listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen error: %v", err)
		}
	}()

	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
	log.Println("server stopped")
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
