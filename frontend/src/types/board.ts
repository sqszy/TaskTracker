export interface Task {
	id: number
	board_id: number
	user_id: number
	title: string
	description: string
	status: 'todo' | 'in_progress' | 'done' | 'need_review'
	priority: 'low' | 'medium' | 'high'
	deadline?: string
	created_at: string
	updated_at: string
}

export interface Board {
	id: number
	user_id: number
	name: string
	created_at: string
	updated_at: string
}

export type ViewMode = 'board' | 'list' | 'timeline'
export type SortOption = 'newest' | 'oldest' | 'deadline_asc' | 'deadline_desc'
