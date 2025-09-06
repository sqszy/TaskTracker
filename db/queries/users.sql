-- name: CreateUser :one
INSERT INTO users (email, password, created_at)
VALUES ($1, $2, NOW())
RETURNING id, email;

SELECT * FROM users WHERE email = $1 LIMIT 1;
