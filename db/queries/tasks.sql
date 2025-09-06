-- name: CreateTask :one
INSERT INTO tasks (board_id, title, description)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetTasks :many
SELECT * FROM tasks
WHERE board_id = $1;
