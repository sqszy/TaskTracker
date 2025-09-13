import api from './axios'
export async function getBoards() {
	const r = await api.get('/GetBoards')
	return r.data
}
export async function createBoard(name: string) {
	const r = await api.post('/CreateBoard', { name })
	return r.data
}
