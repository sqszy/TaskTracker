-- name: CreateBoard :one
INSERT INTO boards (name, user_id)
VALUES ($1, $2)
RETURNING *;

-- name: GetBoards :many
SELECT * FROM boards
WHERE user_id = $1;

-- name: UpdateBoard :one
UPDATE boards
SET
    name = COALESCE(sqlc.narg('name'), name),
    updated_at = now()
WHERE id = @id AND user_id = @user_id
RETURNING id, user_id, name, created_at, updated_at;

-- name: DeleteBoard :execrows
DELETE FROM boards
WHERE id = @id AND user_id = @user_id;