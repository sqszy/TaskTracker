export interface Task {
	id: number
	user_id: number
	title: string
	description?: string | null
	status: string
	created_at?: string
	updated_at?: string
	board_id?: number
}

export interface Board {
	id: number
	user_id: number
	name: string
	created_at?: string
	updated_at?: string
}
