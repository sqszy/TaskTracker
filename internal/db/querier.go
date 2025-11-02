package db

import (
	"context"
)

type Querier interface {
	CreateBoard(ctx context.Context, arg CreateBoardParams) (Board, error)
	GetBoards(ctx context.Context, userID int32) ([]Board, error)
	UpdateBoard(ctx context.Context, arg UpdateBoardParams) (Board, error)
	DeleteBoard(ctx context.Context, arg DeleteBoardParams) (int64, error)

	CreateTask(ctx context.Context, arg CreateTaskParams) (CreateTaskRow, error)
	GetTasks(ctx context.Context, arg GetTasksParams) ([]GetTasksRow, error)
	UpdateTask(ctx context.Context, arg UpdateTaskParams) (Task, error)
	DeleteTask(ctx context.Context, arg DeleteTaskParams) (int64, error)

	CreateUser(ctx context.Context, arg CreateUserParams) (CreateUserRow, error)
	GetUserByEmail(ctx context.Context, email string) (GetUserByEmailRow, error)
}

var _ Querier = (*Queries)(nil)
