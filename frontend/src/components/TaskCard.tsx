import React from 'react'
import type { Task } from '../types/board'

interface TaskCardProps {
	task: Task
	onUpdate?: (taskId: number, updates: Partial<Task>) => void
	onDelete?: (taskId: number) => void
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'bg-red-100 text-red-800 border-red-200'
			case 'medium':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200'
			case 'low':
				return 'bg-green-100 text-green-800 border-green-200'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'todo':
				return 'bg-gray-100 text-gray-800'
			case 'in_progress':
				return 'bg-blue-100 text-blue-800'
			case 'need_review':
				return 'bg-purple-100 text-purple-800'
			case 'done':
				return 'bg-green-100 text-green-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const getDeadlineColor = (deadline?: string) => {
		if (!deadline) return 'text-gray-500'

		const now = new Date()
		const deadlineDate = new Date(deadline)
		const diffDays = Math.ceil(
			(deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
		)

		if (diffDays < 0) return 'text-red-600' // Overdue
		if (diffDays <= 3) return 'text-yellow-600' // Soon
		return 'text-green-600' // OK
	}

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'No deadline'
		return new Date(dateString).toLocaleDateString()
	}

	return (
		<div className='p-4 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200 group'>
			{/* Header */}
			<div className='flex justify-between items-start mb-3'>
				<h3 className='font-semibold text-gray-900 flex-1 pr-2'>
					{task.title}
				</h3>
				<div className='flex items-center gap-2'>
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
							task.priority
						)}`}
					>
						{task.priority}
					</span>
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
							task.status
						)}`}
					>
						{task.status.replace('_', ' ')}
					</span>
				</div>
			</div>

			{/* Description */}
			{task.description && (
				<p className='text-sm text-gray-600 mb-3 line-clamp-2'>
					{task.description}
				</p>
			)}

			{/* Footer */}
			<div className='flex justify-between items-center'>
				<div className='flex items-center gap-2'>
					{/* Avatar placeholder */}
					<div className='w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs'>
						{task.user_id.toString().slice(-2)}
					</div>

					{/* Deadline */}
					<span
						className={`text-xs font-medium ${getDeadlineColor(task.deadline)}`}
					>
						{formatDate(task.deadline)}
					</span>
				</div>

				{/* Actions */}
				<div className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1'>
					<button className='p-1 hover:bg-gray-100 rounded-lg transition-colors'>
						✏️
					</button>
					<button
						onClick={() => onDelete?.(task.id)}
						className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
					>
						🗑️
					</button>
				</div>
			</div>
		</div>
	)
}
