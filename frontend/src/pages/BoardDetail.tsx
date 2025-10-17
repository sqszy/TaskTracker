import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	getTasks,
	updateTask,
	deleteTask,
	type GetTasksParams,
} from '../api/tasks'
import type { Task, ViewMode, SortOption, TaskStatus } from '../types/board'
import SearchBar from '../components/SearchBar'
import FilterDropdown from '../components/FilterDropdown'
import SortSelect from '../components/SortSelect'
import ViewSwitch from '../components/ViewSwitch'
import TaskCard from '../components/TaskCard'
import KanbanColumn from '../components/KanbanColumn'
import TaskModal from '../components/TaskModal'
import { useToast } from '../hooks/useToast'

interface Filters {
	status: string
	priority: string
	deadline: 'with' | 'without' | ''
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
	{ value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
	{
		value: 'in_progress',
		label: 'In Progress',
		color: 'bg-blue-100 text-blue-800',
	},
	{
		value: 'need_review',
		label: 'Need Review',
		color: 'bg-yellow-100 text-yellow-800',
	},
	{ value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' },
]

export default function BoardDetail() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const boardID = Number(id)
	const { addToast } = useToast()

	const [tasks, setTasks] = useState<Task[]>([])
	const [search, setSearch] = useState('')
	const [filters, setFilters] = useState<Filters>({
		status: '',
		priority: '',
		deadline: '',
	})
	const [sort, setSort] = useState<SortOption>('newest')
	const [viewMode, setViewMode] = useState<ViewMode>('board')
	const [loading, setLoading] = useState(false)
	const [taskModalOpen, setTaskModalOpen] = useState(false)
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)
	const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('todo')
	const [error, setError] = useState<string | null>(null)

	// Load tasks with filters
	const loadTasks = useCallback(async () => {
		if (!boardID) return

		setLoading(true)
		setError(null)
		const params: GetTasksParams = {
			search: search || undefined,
			status: filters.status || undefined,
			priority: filters.priority || undefined,
			deadline: filters.deadline || undefined,
			sort_by:
				sort === 'deadline_asc' || sort === 'deadline_desc'
					? 'deadline'
					: 'created',
			sort_dir: sort === 'newest' || sort === 'deadline_desc' ? 'desc' : 'asc',
		}

		try {
			const data = await getTasks(boardID, params)
			setTasks(data || [])
		} catch (err) {
			console.error('Failed to load tasks:', err)
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to load tasks'
			setError(errorMessage)
			addToast('Failed to load tasks', 'error')
			setTasks([])
		} finally {
			setLoading(false)
		}
	}, [boardID, search, filters, sort, addToast])

	useEffect(() => {
		loadTasks()
	}, [loadTasks])

	const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
		try {
			await updateTask(boardID, taskId, updates)
			addToast('Task updated successfully', 'success')
			loadTasks()
		} catch (err) {
			console.error('Failed to update task:', err)
			addToast('Failed to update task', 'error')
		}
	}

	const handleDeleteTask = async (taskId: number) => {
		if (!confirm('Are you sure you want to delete this task?')) return

		try {
			await deleteTask(boardID, taskId)
			addToast('Task deleted successfully', 'success')
			loadTasks()
		} catch (err) {
			console.error('Failed to delete task:', err)
		}
	}

	const openTaskModal = (task?: Task, status?: TaskStatus) => {
		setSelectedTask(task || null)
		if (status) {
			setSelectedStatus(status)
		} else if (task) {
			setSelectedStatus(task.status)
		} else {
			setSelectedStatus('todo')
		}
		setTaskModalOpen(true)
	}

	// Group tasks by status for Kanban view
	const tasksByStatus = STATUS_OPTIONS.reduce((acc, status) => {
		acc[status.value] = tasks.filter(task => task.status === status.value)
		return acc
	}, {} as Record<TaskStatus, Task[]>)

	if (!boardID) {
		return (
			<div className='text-center py-12'>
				<div className='text-2xl text-gray-500'>Board not found</div>
				<button
					onClick={() => navigate('/dashboard')}
					className='mt-4 px-4 py-2 rounded-xl bg-blue-500 text-white'
				>
					Back to Dashboard
				</button>
			</div>
		)
	}

	return (
		<div className='max-w-7xl mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex justify-between items-start mb-6'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							Board {boardID}
						</h1>
						<p className='text-gray-600'>
							{tasks.length} task{tasks.length !== 1 ? 's' : ''} total
						</p>
					</div>

					<button
						onClick={() => openTaskModal()}
						className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2'
					>
						<svg
							className='w-5 h-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 4v16m8-8H4'
							/>
						</svg>
						<span>Add Task</span>
					</button>
				</div>

				{/* Controls Bar */}
				<div className='flex flex-wrap gap-4 items-center justify-between p-4 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200'>
					<SearchBar
						value={search}
						onChange={setSearch}
						placeholder='Search tasks...'
						debounceMs={500}
					/>

					<div className='flex items-center gap-3'>
						<FilterDropdown filters={filters} onFiltersChange={setFilters} />
						<SortSelect value={sort} onChange={setSort} />
						<ViewSwitch mode={viewMode} onChange={setViewMode} />

						<button
							onClick={loadTasks}
							className='p-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 clickable'
							title='Refresh tasks'
							disabled={loading}
						>
							{loading ? (
								<div className='w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
							) : (
								<svg
									className='w-5 h-5 hover:rotate-180 transition-transform duration-300'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Error State */}
			{error && (
				<div className='text-center py-8'>
					<div className='text-red-600 bg-red-50 p-4 rounded-xl border border-red-200'>
						<p className='font-semibold'>Error loading tasks</p>
						<p className='text-sm mt-1'>{error}</p>
						<button
							onClick={loadTasks}
							className='mt-3 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors'
						>
							Try Again
						</button>
					</div>
				</div>
			)}

			{/* Loading State */}
			{loading && !error && (
				<div className='text-center py-8'>
					<div className='text-gray-600'>Loading tasks...</div>
				</div>
			)}

			{/* Tasks View */}
			{!loading && !error && (
				<>
					{viewMode === 'board' ? (
						// Kanban Board View
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							{STATUS_OPTIONS.map(status => (
								<KanbanColumn
									key={status.value}
									title={status.label}
									status={status.value}
									tasks={tasksByStatus[status.value] || []}
									onTaskUpdate={handleUpdateTask}
									onTaskClick={openTaskModal}
									onAddTask={() => openTaskModal(undefined, status.value)}
									color={status.color}
								/>
							))}
						</div>
					) : (
						// List View
						<div className='grid grid-cols-1 gap-4'>
							{tasks.length === 0 ? (
								<div className='col-span-full text-center py-12'>
									<div className='text-4xl mb-4'>📝</div>
									<h3 className='text-lg font-semibold text-gray-900 mb-2'>
										No tasks yet
									</h3>
									<p className='text-gray-600 mb-6'>
										Create your task to get started
									</p>
									<button
										onClick={() => openTaskModal()}
										className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
									>
										Create Task
									</button>
								</div>
							) : (
								tasks.map(task => (
									<TaskCard
										key={task.id}
										task={task}
										onUpdate={handleUpdateTask}
										onClick={openTaskModal}
									/>
								))
							)}
						</div>
					)}
				</>
			)}

			{/* Task Modal с переданным статусом */}
			<TaskModal
				open={taskModalOpen}
				onClose={() => {
					setTaskModalOpen(false)
					setSelectedTask(null)
					setSelectedStatus('todo')
				}}
				boardID={boardID}
				task={selectedTask}
				initialStatus={selectedStatus}
				mode={selectedTask ? 'edit' : 'create'}
				onTaskUpdate={loadTasks}
				onDelete={handleDeleteTask}
			/>
		</div>
	)
}
