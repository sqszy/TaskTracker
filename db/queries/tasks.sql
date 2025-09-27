-- name: CreateTask :one
INSERT INTO tasks (board_id, user_id, title, description, status, priority, deadline)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, user_id, title, description, status, priority, deadline, created_at, updated_at, board_id;

-- name: GetTasks :many
SELECT id, user_id, title, description, status, priority, deadline, created_at, updated_at, board_id
FROM tasks
WHERE board_id = $1
ORDER BY created_at DESC;

-- name: UpdateTask :one
UPDATE tasks
SET title       = COALESCE($2, title),
    description = COALESCE($3, description),
    status      = COALESCE($4, status),
    priority    = COALESCE($5, priority),
    deadline    = COALESCE($6, deadline),
    updated_at  = now()
WHERE id = $1
RETURNING id, user_id, title, description, status, priority, deadline, created_at, updated_at, board_id;
