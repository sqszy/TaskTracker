INSERT INTO users (email, password)
VALUES ($1, $2)
RETURNING *;

SELECT * FROM users WHERE email = $1 LIMIT 1;
