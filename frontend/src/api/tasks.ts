import api from './axios'
import type { Task } from '../types/board'

export async function getTasks(boardID: number): Promise<Task[]> {
	const res = await api.get(`/boards/${boardID}/GetTasks`)
	return res.data
}

export async function createTask(
	boardID: number,
	title: string,
	description = ''
) {
	const res = await api.post(`/boards/${boardID}/CreateTasks`, {
		title,
		description,
	})
	return res.data
}
