-- name: CreateTask :one
INSERT INTO tasks (board_id, user_id, title, description, status, priority, deadline)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, user_id, title, description, status, priority, deadline, created_at, updated_at, board_id;

-- name: GetTasks :many
SELECT 
  id, user_id, title, description, status, priority, deadline, created_at, updated_at, board_id
FROM tasks
WHERE board_id = sqlc.arg(board_id)
  AND (
    COALESCE(sqlc.arg(search)::text, '') = '' OR
    title ILIKE '%' || sqlc.arg(search)::text || '%' OR
    description ILIKE '%' || sqlc.arg(search)::text || '%'
  )
  AND (
    COALESCE(sqlc.arg(status)::text, '') = '' OR
    status = sqlc.arg(status)
  )
  AND (
    COALESCE(sqlc.arg(priority)::text, '') = '' OR
    priority = sqlc.arg(priority)
  )
  AND (
    sqlc.arg(has_deadline_set)::bool = false
    OR (
      sqlc.arg(has_deadline_set)::bool = true AND
      (
        (sqlc.arg(has_deadline)::bool = true AND deadline IS NOT NULL)
        OR
        (sqlc.arg(has_deadline)::bool = false AND deadline IS NULL)
      )
    )
  )
ORDER BY
  CASE WHEN sqlc.arg(sort_code)::int = 0 THEN created_at END DESC,
  CASE WHEN sqlc.arg(sort_code)::int = 1 THEN created_at END ASC,
  CASE WHEN sqlc.arg(sort_code)::int = 2 THEN deadline END ASC NULLS LAST,
  CASE WHEN sqlc.arg(sort_code)::int = 3 THEN deadline END DESC NULLS LAST,
  created_at DESC;

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