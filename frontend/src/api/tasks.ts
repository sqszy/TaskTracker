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
	// Преобразуем дедлайн в правильный формат для бекенда
	let formattedDeadline = undefined
	if (deadline) {
		// Создаем Date объект и преобразуем в ISO строку
		const date = new Date(deadline)
		formattedDeadline = date.toISOString()
	}

	const r = await api.post(`/boards/${boardID}/CreateTask`, {
		title,
		description,
		status,
		priority,
		deadline: formattedDeadline,
	})
	return r.data
}

export async function updateTask(
	boardID: number,
	taskID: number,
	updates: {
		title?: string
		description?: string
		status?: string
		priority?: string
		deadline?: string
	}
) {
	// Преобразуем дедлайн в правильный формат
	let formattedDeadline = undefined
	if (updates.deadline) {
		const date = new Date(updates.deadline)
		formattedDeadline = date.toISOString()
	}

	const r = await api.patch(`/boards/${boardID}/tasks/${taskID}`, {
		...updates,
		deadline: formattedDeadline,
	})
	return r.data
}

export async function deleteTask(boardID: number, taskID: number) {
	const r = await api.delete(`/boards/${boardID}/tasks/${taskID}`)
	return r.data
}
