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
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"

	appauth "github.com/sqszy/TaskTracker/internal/auth"
	appdb "github.com/sqszy/TaskTracker/internal/db"
	handlers "github.com/sqszy/TaskTracker/internal/handlers"
	appmw "github.com/sqszy/TaskTracker/internal/middleware"
)

func main() {
	_ = godotenv.Load()

	port := env("PORT", "8080")
	dbURL := env("DB_URL", "")
	redisAddr := env("REDIS_ADDR", "localhost:6379")

	accessSecret := env("JWT_ACCESS_SECRET", "")
	refreshSecret := env("JWT_REFRESH_SECRET", "")
	accessTTLstr := env("JWT_ACCESS_TTL", "15m")
	refreshTTLstr := env("JWT_REFRESH_TTL", "168h") // 7 дней

	if dbURL == "" || accessSecret == "" || refreshSecret == "" {
		log.Fatal("DB_URL, JWT_ACCESS_SECRET или JWT_REFRESH_SECRET не заданы")
	}

	accessTTL, err := time.ParseDuration(accessTTLstr)
	if err != nil {
		log.Fatalf("parse JWT_ACCESS_TTL: %v", err)
	}
	refreshTTL, err := time.ParseDuration(refreshTTLstr)
	if err != nil {
		log.Fatalf("parse JWT_REFRESH_TTL: %v", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Postgres
	dbpool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("pg connect error: %v", err)
	}
	defer dbpool.Close()
	if err := dbpool.Ping(ctx); err != nil {
		log.Fatalf("pg ping error: %v", err)
	}

	// Redis
	rdb := redis.NewClient(&redis.Options{Addr: redisAddr})
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("redis connect error: %v", err)
	}

	// sqlc queries
	queries := appdb.New(dbpool)

	// auth service
	authSvc := appauth.NewService(rdb, accessSecret, refreshSecret, accessTTL, refreshTTL)

	// handlers
	authHandler := handlers.NewAuthHandler(queries, authSvc)
	boardHandler := handlers.NewBoardHandler(queries)
	taskHandler := handlers.NewTaskHandler(queries)

	r := chi.NewRouter()

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // адрес фронта
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))

	// Logger middleware
	r.Use(RequestLogger)
	r.Use(jsonContentType)

	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok", "db": "up"})
	})

	// public routes
	r.Post("/signup", authHandler.Signup)
	r.Post("/login", authHandler.Login)
	r.Post("/refresh", authHandler.Refresh)
	r.Post("/logout", authHandler.Logout)

	// protected routes
	r.Group(func(r chi.Router) {
		r.Use(appmw.AuthMiddleware(authSvc))

		r.Get("/GetBoards", boardHandler.GetBoards)
		r.Post("/CreateBoard", boardHandler.CreateBoard)

		r.Patch("/boards/{boardID}", boardHandler.PatchBoard)
		r.Delete("/boards/{boardID}", boardHandler.DeleteBoard)

		r.Get("/boards/{boardID}/GetTasks", taskHandler.GetTasks)
		r.Post("/boards/{boardID}/CreateTask", taskHandler.CreateTask)

		r.Patch("/boards/{boardID}/tasks/{taskID}", taskHandler.PatchTask)
		r.Delete("/boards/{boardID}/tasks/{taskID}", taskHandler.DeleteTask)

		r.Get("/protected/me", func(w http.ResponseWriter, r *http.Request) {
			uid, _ := appmw.GetUserID(r)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"user_id": uid})
		})
	})

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("listening :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("http server error: %v", err)
		}
	}()

	<-ctx.Done()
	_ = srv.Shutdown(context.Background())
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

// jsonContentType гарантирует JSON по умолчанию
func jsonContentType(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		next.ServeHTTP(w, r)
	})
}

// RequestLogger логирует входящие запросы
func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("[Request] %s %s started", r.Method, r.URL.Path)

		// Запускаем следующий хендлер
		next.ServeHTTP(w, r)

		duration := time.Since(start)
		log.Printf("[Request] %s %s completed in %v", r.Method, r.URL.Path, duration)
	})
}
