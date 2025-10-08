import type { Task } from '../types/board'
import api from './axios'

export interface GetTasksParams {
	search?: string
	status?: string
	priority?: string
	deadline?: 'with' | 'without'
	sort_by?: 'created' | 'deadline'
	sort_dir?: 'asc' | 'desc'
}

export async function getTasks(boardID: number, params?: GetTasksParams) {
	const r = await api.get(`/boards/${boardID}/GetTasks`, { params })
	return r.data
}

export async function createTask(
	boardID: number,
	title: string,
	description = '',
	status: string = 'todo',
	priority: string = 'medium',
	deadline?: string
) {
	const r = await api.post(`/boards/${boardID}/CreateTask`, {
		title,
		description,
		status,
		priority,
		deadline,
	})
	return r.data
}

export async function updateTask(
	boardID: number,
	taskID: number,
	updates: Partial<Task>
) {
	const r = await api.patch(`/boards/${boardID}/tasks/${taskID}`, updates)
	return r.data
}

export async function deleteTask(boardID: number, taskID: number) {
	const r = await api.delete(`/boards/${boardID}/tasks/${taskID}`)
	return r.data
}
