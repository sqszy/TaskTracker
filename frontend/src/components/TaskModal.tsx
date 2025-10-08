import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import type { Task, TaskStatus, TaskPriority } from '../types/board'
import { createTask, updateTask } from '../api/tasks'

interface TaskModalProps {
	open: boolean
	onClose: () => void
	boardID: number
	task?: Task | null
	mode: 'create' | 'edit'
	onTaskUpdate: () => void
}

export default function TaskModal({
	open,
	onClose,
	boardID,
	task,
	mode,
	onTaskUpdate,
}: TaskModalProps) {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		status: 'todo' as TaskStatus,
		priority: 'medium' as TaskPriority,
		deadline: '',
	})
	const [loading, setLoading] = useState(false)

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
				status: 'todo',
				priority: 'medium',
				deadline: '',
			})
		}
	}, [task, mode, open])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.title.trim()) {
			alert('Title is required')
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
			} else if (task) {
				await updateTask(boardID, task.id, {
					title: formData.title,
					description: formData.description,
					status: formData.status,
					priority: formData.priority,
					deadline: formData.deadline || undefined,
				})
			}

			onTaskUpdate()
			onClose()
		} catch (err) {
			console.error('Failed to save task:', err)
			alert('Failed to save task')
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

		if (diffDays < 0) return 'border-red-200 bg-red-50'
		if (diffDays <= 3) return 'border-yellow-200 bg-yellow-50'
		return 'border-green-200 bg-green-50'
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={mode === 'create' ? 'Create New Task' : 'Edit Task'}
			width='max-w-2xl'
		>
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

				{/* Progress Bar (for edit mode) */}
				{mode === 'edit' && (
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Progress
						</label>
						<div className='w-full bg-gray-200 rounded-full h-2'>
							<div
								className='bg-green-500 h-2 rounded-full transition-all duration-300'
								style={{ width: '0%' }} // You can add progress calculation later
							/>
						</div>
						<div className='flex justify-between text-xs text-gray-500 mt-1'>
							<span>0%</span>
							<span>0/0 subtasks</span>
						</div>
					</div>
				)}

				{/* Actions */}
				<div className='flex gap-3 pt-4 border-t border-gray-200'>
					<button
						type='button'
						onClick={onClose}
						className='flex-1 py-3 rounded-xl border border-gray-200 bg-white/70 hover:bg-white/90 transition-all duration-200'
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
