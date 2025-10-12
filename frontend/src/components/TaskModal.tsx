import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import type { Task, TaskStatus, TaskPriority } from '../types/board'
import { createTask, updateTask, deleteTask } from '../api/tasks'
import { useToast } from '../hooks/useToast'

interface TaskModalProps {
	open: boolean
	onClose: () => void
	boardID: number
	task?: Task | null
	initialStatus?: TaskStatus
	mode: 'create' | 'edit'
	onTaskUpdate: () => void
	onDelete?: (taskId: number) => void
}

export default function TaskModal({
	open,
	onClose,
	boardID,
	task,
	initialStatus = 'todo',
	mode,
	onTaskUpdate,
	onDelete,
}: TaskModalProps) {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		status: 'todo' as TaskStatus,
		priority: 'medium' as TaskPriority,
		deadline: '',
	})
	const [loading, setLoading] = useState(false)
	const { addToast } = useToast()

	useEffect(() => {
		if (task && mode === 'edit') {
			setFormData({
				title: task.title,
				description: task.description || '',
				status: task.status,
				priority: task.priority,
				deadline: task.deadline
					? new Date(task.deadline).toISOString().split('T')[0]
					: '',
			})
		} else {
			setFormData({
				title: '',
				description: '',
				status: initialStatus,
				priority: 'medium',
				deadline: '',
			})
		}
	}, [task, mode, open, initialStatus])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.title.trim()) {
			addToast('Title is required', 'error')
			return
		}

		setLoading(true)
		try {
			if (mode === 'create') {
				await createTask(
					boardID,
					formData.title.trim(),
					formData.description,
					formData.status,
					formData.priority,
					formData.deadline || undefined
				)
				addToast('Task created successfully', 'success')
			} else if (task) {
				await updateTask(boardID, task.id, {
					title: formData.title,
					description: formData.description,
					status: formData.status,
					priority: formData.priority,
					deadline: formData.deadline || undefined,
				})
				addToast('Task updated successfully', 'success')
			}

			onTaskUpdate()
			onClose()
		} catch (err: unknown) {
			console.error('Failed to save task:', err)
			addToast('Failed to save task', 'error')
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		if (!task || !onDelete) return

		setLoading(true)
		try {
			await deleteTask(boardID, task.id)
			addToast('Task deleted successfully', 'success')
			onDelete(task.id)
			onClose()
		} catch (err: unknown) {
			console.error('Failed to delete task:', err)
			addToast('Failed to delete task', 'error')
		} finally {
			setLoading(false)
		}
	}

	const getDeadlineColor = (deadline: string) => {
		if (!deadline) return 'border-gray-200'
		const now = new Date()
		const deadlineDate = new Date(deadline)
		const diffDays = Math.ceil(
			(deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
		)

		if (diffDays < 0)
			return 'border-red-500 bg-red-200 text-red-900 font-semibold shadow-sm animate-pulse'
		if (diffDays <= 3)
			return 'border-yellow-500 bg-yellow-200 text-yellow-900 font-semibold shadow-sm animate-pulse'
		return 'border-green-500 bg-green-200 text-green-900 font-semibold shadow-sm animate-pulse'
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={mode === 'create' ? 'Create New Task' : 'Edit Task'}
			width='max-w-2xl'
		>
			{mode === 'edit' && task && (
				<div className='absolute top-4 right-4'>
					<button
						type='button'
						onClick={handleDelete}
						disabled={loading}
						className='px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all duration-200 disabled:opacity-50 text-sm'
					>
						{loading ? 'Deleting...' : 'Delete Task'}
					</button>
				</div>
			)}

			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Title */}
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-2'>
						Title *
					</label>
					<input
						type='text'
						required
						value={formData.title}
						onChange={e =>
							setFormData(prev => ({ ...prev, title: e.target.value }))
						}
						className='w-full p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						placeholder='Enter task title...'
					/>
				</div>

				{/* Description */}
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-2'>
						Description
					</label>
					<textarea
						value={formData.description}
						onChange={e =>
							setFormData(prev => ({ ...prev, description: e.target.value }))
						}
						rows={4}
						className='w-full p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						placeholder='Enter task description...'
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					{/* Status */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Status
						</label>
						<select
							value={formData.status}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									status: e.target.value as TaskStatus,
								}))
							}
							className='w-full p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						>
							<option value='todo'>To Do</option>
							<option value='in_progress'>In Progress</option>
							<option value='need_review'>Need Review</option>
							<option value='done'>Done</option>
						</select>
					</div>

					{/* Priority */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Priority
						</label>
						<select
							value={formData.priority}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									priority: e.target.value as TaskPriority,
								}))
							}
							className='w-full p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						>
							<option value='low'>Low</option>
							<option value='medium'>Medium</option>
							<option value='high'>High</option>
						</select>
					</div>

					{/* Deadline */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Deadline
						</label>
						<input
							type='date'
							value={formData.deadline}
							onChange={e =>
								setFormData(prev => ({ ...prev, deadline: e.target.value }))
							}
							className={`w-full p-3 rounded-xl border bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getDeadlineColor(
								formData.deadline
							)}`}
						/>
					</div>
				</div>

				{/* Actions */}
				<div className='flex gap-3 pt-4 border-t border-gray-200'>
					<button
						type='button'
						onClick={onClose}
						className='flex-1 py-3 rounded-xl border border-gray-200 bg-white/70 hover:bg-white/90 transition-all duration-200'
						disabled={loading}
					>
						Cancel
					</button>
					<button
						type='submit'
						disabled={loading}
						className='flex-1 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50'
					>
						{loading
							? 'Saving...'
							: mode === 'create'
							? 'Create Task'
							: 'Update Task'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
