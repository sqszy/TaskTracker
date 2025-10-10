import React, { useState, useEffect } from 'react'
import type { Board, Task } from '../types/board'
import { getTasks } from '../api/tasks'

interface BoardCardProps {
	board: Board
	onDelete: (boardId: number) => void
	onOpen: (boardId: number) => void
}

export default function BoardCard({ board, onDelete, onOpen }: BoardCardProps) {
	const [tasks, setTasks] = useState<Task[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadTasks()
	}, [board.id])

	const loadTasks = async () => {
		try {
			const tasksData = await getTasks(board.id, {
				sort_by: 'deadline',
				sort_dir: 'asc',
			})
			setTasks(tasksData || [])
		} catch (err) {
			console.error('Failed to load tasks:', err)
			setTasks([])
		} finally {
			setLoading(false)
		}
	}

	const getDeadlineColor = (deadline?: string) => {
		if (!deadline) return 'text-gray-500'

		const now = new Date()
		const deadlineDate = new Date(deadline)
		const diffDays = Math.ceil(
			(deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
		)

		if (diffDays < 0) return 'text-red-600 font-semibold'
		if (diffDays <= 3) return 'text-yellow-600'
		return 'text-green-600'
	}

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'No deadline'
		return new Date(dateString).toLocaleDateString()
	}

	const getNearestTask = () => {
		return tasks.find(task => task.deadline) || tasks[0]
	}

	const nearestTask = getNearestTask()

	return (
		<div className='bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group'>
			{/* Header */}
			<div className='p-6 border-b border-white/20'>
				<div className='flex justify-between items-start mb-3'>
					<h3 className='text-lg font-semibold text-gray-900 truncate flex-1 pr-2'>
						{board.name}
					</h3>
					<button
						onClick={e => {
							e.stopPropagation()
							onDelete(board.id)
						}}
						className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded-lg text-red-500'
						title='Delete board'
					>
						<svg
							className='w-4 h-4'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
							/>
						</svg>
					</button>
				</div>

				{/* Nearest Deadline */}
				{nearestTask && (
					<div className='flex items-center justify-between text-sm'>
						<span className='text-gray-600'>Nearest deadline:</span>
						<span
							className={`font-medium ${getDeadlineColor(
								nearestTask.deadline
							)}`}
						>
							{formatDate(nearestTask.deadline)}
						</span>
					</div>
				)}
			</div>

			{/* Tasks List */}
			<div className='p-4'>
				{loading ? (
					<div className='flex justify-center py-4'>
						<div className='w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
					</div>
				) : tasks.length === 0 ? (
					<div className='text-center py-4 text-gray-500 text-sm'>
						No tasks yet
					</div>
				) : (
					<div className='space-y-2'>
						{tasks.slice(0, 4).map(task => (
							<div
								key={task.id}
								className='flex items-center justify-between p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200'
							>
								<div className='flex items-center gap-2 flex-1 min-w-0'>
									<div
										className={`w-2 h-2 rounded-full ${
											task.status === 'done'
												? 'bg-green-500'
												: task.status === 'in_progress'
												? 'bg-blue-500'
												: task.status === 'need_review'
												? 'bg-yellow-500'
												: 'bg-gray-500'
										}`}
									></div>
									<span className='text-sm text-gray-700 truncate'>
										{task.title}
									</span>
								</div>
								{task.deadline && (
									<span
										className={`text-xs ${getDeadlineColor(
											task.deadline
										)} whitespace-nowrap ml-2`}
									>
										{formatDate(task.deadline)}
									</span>
								)}
							</div>
						))}
						{tasks.length > 4 && (
							<div className='text-center text-xs text-gray-500 pt-2'>
								+{tasks.length - 4} more tasks
							</div>
						)}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className='p-4 border-t border-white/20 bg-white/5'>
				<button
					onClick={() => onOpen(board.id)}
					className='w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-sm font-medium text-gray-700'
				>
					Open Board
				</button>
			</div>
		</div>
	)
}
