package mocks

import (
	"context"

	"github.com/sqszy/TaskTracker/internal/db"
	"github.com/stretchr/testify/mock"
)

type MockQuerier struct {
	mock.Mock
}

func (m *MockQuerier) CreateBoard(ctx context.Context, arg db.CreateBoardParams) (db.Board, error) {
	args := m.Called(ctx, arg)
	return args.Get(0).(db.Board), args.Error(1)
}

func (m *MockQuerier) GetBoards(ctx context.Context, userID int32) ([]db.Board, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]db.Board), args.Error(1)
}

func (m *MockQuerier) UpdateBoard(ctx context.Context, arg db.UpdateBoardParams) (db.Board, error) {
	args := m.Called(ctx, arg)
	return args.Get(0).(db.Board), args.Error(1)
}

func (m *MockQuerier) DeleteBoard(ctx context.Context, arg db.DeleteBoardParams) (int64, error) {
	args := m.Called(ctx, arg)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockQuerier) CreateTask(ctx context.Context, arg db.CreateTaskParams) (db.CreateTaskRow, error) {
	args := m.Called(ctx, arg)
	return args.Get(0).(db.CreateTaskRow), args.Error(1)
}

func (m *MockQuerier) GetTasks(ctx context.Context, arg db.GetTasksParams) ([]db.GetTasksRow, error) {
	args := m.Called(ctx, arg)
	return args.Get(0).([]db.GetTasksRow), args.Error(1)
}

func (m *MockQuerier) UpdateTask(ctx context.Context, arg db.UpdateTaskParams) (db.Task, error) {
	args := m.Called(ctx, arg)
	return args.Get(0).(db.Task), args.Error(1)
}

func (m *MockQuerier) DeleteTask(ctx context.Context, arg db.DeleteTaskParams) (int64, error) {
	args := m.Called(ctx, arg)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockQuerier) CreateUser(ctx context.Context, arg db.CreateUserParams) (db.CreateUserRow, error) {
	args := m.Called(ctx, arg)
	return args.Get(0).(db.CreateUserRow), args.Error(1)
}

func (m *MockQuerier) GetUserByEmail(ctx context.Context, email string) (db.GetUserByEmailRow, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(db.GetUserByEmailRow), args.Error(1)
}
