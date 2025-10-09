import { useCallback, useEffect, useState } from 'react'
import Modal from './Modal'
import { getTasks, deleteTask } from '../api/tasks'
import type { Task } from '../types/board'
import { useAuthStore } from '../store/auth'
import TaskModal from './TaskModal'
import TaskCard from './TaskCard'
import { useToast } from '../hooks/useToast'

export default function BoardDetailModal({
	open,
	onClose,
	boardID,
	boardName,
	onTaskUpdate,
}: {
	open: boolean
	onClose: () => void
	boardID?: number
	boardName?: string
	onTaskUpdate?: () => void
}) {
	const [tasks, setTasks] = useState<Task[]>([])
	const [loading, setLoading] = useState(false)
	const [taskModalOpen, setTaskModalOpen] = useState(false)
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)
	const token = useAuthStore(s => s.accessToken)
	const { addToast } = useToast()

	const loadTasks = useCallback(async () => {
		if (!boardID) return
		setLoading(true)
		try {
			const data = await getTasks(boardID)
			setTasks(data)
		} catch (e) {
			console.error(e)
			addToast('Failed to load tasks', 'error')
		} finally {
			setLoading(false)
		}
	}, [boardID, addToast])

	useEffect(() => {
		if (!open || !boardID) return
		loadTasks()
	}, [open, boardID, loadTasks])

	const handleDeleteTask = async (taskId: number) => {
		if (!boardID) return
		if (!confirm('Are you sure you want to delete this task?')) return

		try {
			await deleteTask(boardID, taskId)
			setTasks(prev => prev.filter(task => task.id !== taskId))
			onTaskUpdate?.()
			addToast('Task deleted successfully', 'success')
		} catch (e) {
			console.error(e)
			addToast('Cannot delete task', 'error')
		}
	}

	const handleTaskUpdate = () => {
		loadTasks()
		onTaskUpdate?.()
	}

	const openTaskModal = (task?: Task) => {
		if (!token) {
			addToast('Please login to manage tasks', 'error')
			return
		}
		setSelectedTask(task || null)
		setTaskModalOpen(true)
	}

	const getTasksByStatus = (status: string) => {
		return tasks.filter(task => task.status === status)
	}

	const statusColumns = [
		{ value: 'todo', label: 'To Do', color: 'bg-gray-100' },
		{ value: 'in_progress', label: 'In Progress', color: 'bg-blue-100' },
		{ value: 'need_review', label: 'Need Review', color: 'bg-yellow-100' },
		{ value: 'done', label: 'Done', color: 'bg-green-100' },
	]

	return (
		<>
			<Modal
				open={open}
				onClose={onClose}
				title={boardName || 'Board'}
				width='max-w-7xl'
			>
				<div className='space-y-6'>
					{/* Header with Add Button */}
					<div className='flex justify-between items-center'>
						<div>
							<h2 className='text-xl font-semibold text-gray-900'>
								{boardName}
							</h2>
							<p className='text-gray-600'>{tasks.length} tasks</p>
						</div>
						<button
							onClick={() => openTaskModal()}
							className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
						>
							+ Add Task
						</button>
					</div>

					{/* Kanban Board */}
					{loading ? (
						<div className='text-center py-8'>
							<div className='text-gray-600'>Loading tasks...</div>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							{statusColumns.map(column => (
								<div key={column.value} className='space-y-4'>
									<div className='flex items-center justify-between p-3 rounded-xl bg-white/70 backdrop-blur-md border border-gray-200/50'>
										<span className='font-semibold text-gray-900'>
											{column.label}
										</span>
										<span className='px-2 py-1 rounded-full text-xs bg-white/80 text-gray-600'>
											{getTasksByStatus(column.value).length}
										</span>
									</div>

									<div className='space-y-3 min-h-[200px]'>
										{getTasksByStatus(column.value).map(task => (
											<div
												key={task.id}
												className='cursor-pointer transform hover:scale-[1.02] transition-transform duration-200'
												onClick={() => openTaskModal(task)}
											>
												<TaskCard
													task={task}
													onUpdate={handleTaskUpdate}
													onDelete={handleDeleteTask}
												/>
											</div>
										))}

										{getTasksByStatus(column.value).length === 0 && (
											<div className='text-center py-8 text-gray-400 text-sm rounded-xl border-2 border-dashed border-gray-300'>
												No tasks
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{tasks.length === 0 && !loading && (
						<div className='text-center py-12'>
							<div className='text-4xl mb-4'>📝</div>
							<h3 className='text-lg font-semibold text-gray-900 mb-2'>
								No tasks yet
							</h3>
							<p className='text-gray-600 mb-6'>
								Create your first task to get started
							</p>
							<button
								onClick={() => openTaskModal()}
								className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
							>
								Create First Task
							</button>
						</div>
					)}
				</div>
			</Modal>

			{/* Task Modal */}
			{boardID && (
				<TaskModal
					open={taskModalOpen}
					onClose={() => {
						setTaskModalOpen(false)
						setSelectedTask(null)
					}}
					boardID={boardID}
					task={selectedTask}
					mode={selectedTask ? 'edit' : 'create'}
					onTaskUpdate={handleTaskUpdate}
				/>
			)}
		</>
	)
}
