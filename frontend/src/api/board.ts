import api from './axios'

export interface Board {
	id: number
	user_id: number
	name: string
	created_at: string
	updated_at: string
}

export interface CreateBoardRequest {
	name: string
}

export interface UpdateBoardRequest {
	name?: string
}

// GET /GetBoards
export async function getBoards(search?: string) {
	const params = search ? { search } : {}
	const r = await api.get('/GetBoards', { params })
	return r.data
}

// POST /CreateBoard
export async function createBoard(name: string) {
	const r = await api.post('/CreateBoard', { name })
	return r.data
}

// PATCH /boards/{boardID}
export async function updateBoard(
	boardID: number,
	updates: UpdateBoardRequest
) {
	const r = await api.patch(`/boards/${boardID}`, updates)
	return r.data
}

// DELETE /boards/{boardID}
export async function deleteBoard(boardID: number) {
	const r = await api.delete(`/boards/${boardID}`)
	return r.data
}
