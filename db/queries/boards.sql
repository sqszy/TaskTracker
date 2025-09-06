-- name: CreateBoard :one
INSERT INTO boards (name, user_id)
VALUES ($1, $2)
RETURNING *;

-- name: GetBoards :many
SELECT * FROM boards
WHERE user_id = $1;
