import api from './axios'
export async function getTasks(boardID: number) {
	const r = await api.get(`/boards/${boardID}/GetTasks`)
	return r.data
}
export async function createTask(
	boardID: number,
	title: string,
	description = ''
) {
	const r = await api.post(`/boards/${boardID}/CreateTasks`, {
		title,
		description,
	})
	return r.data
}
