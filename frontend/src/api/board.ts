import api from './axios'
import type { Board } from '../types/board'

export async function getBoards(): Promise<Board[]> {
	const res = await api.get('/GetBoards')
	return res.data
}

export async function createBoard(name: string) {
	const res = await api.post('/CreateBoard', { name })
	return res.data
}
