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
SET
    title = COALESCE(sqlc.narg('title'), title),
    description = COALESCE(sqlc.narg('description'), description),
    status = COALESCE(sqlc.narg('status'), status),
    priority = COALESCE(sqlc.narg('priority'), priority),
    deadline = COALESCE(sqlc.narg('deadline'), deadline),
    updated_at = now()
WHERE id = @id AND board_id = @board_id AND user_id = @user_id
RETURNING *;

-- name: DeleteTask :execrows
DELETE FROM tasks
WHERE id = @id AND board_id = @board_id AND user_id = @user_id;