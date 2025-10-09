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
	const [error, setError] = useState<string | null>(null)
	const [searchError, setSearchError] = useState<string | null>(null) // Отдельная ошибка для поиска

	// Load tasks with filters
	const loadTasks = useCallback(async () => {
		if (!boardID) return

		setLoading(true)
		setError(null)
		setSearchError(null)

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

			// Если поиск не дал результатов
			if (search && data && data.length === 0) {
				setSearchError('No tasks found matching your search')
			}
		} catch (err) {
			console.error('Failed to load tasks:', err)
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to load tasks'

			if (search) {
				setSearchError(`Search failed: ${errorMessage}`)
			} else {
				setError(errorMessage)
			}

			addToast('Failed to load tasks', 'error')
			setTasks([])
		} finally {
			setLoading(false)
		}
	}, [boardID, search, filters, sort, addToast])

	useEffect(() => {
		const timer = setTimeout(() => {
			loadTasks()
		}, 300) // Задержка 300ms

		return () => clearTimeout(timer)
	}, [search, loadTasks])

	useEffect(() => {
		loadTasks()
	}, [filters, sort, viewMode, loadTasks])

	const handleSearchError = (error: string) => {
		setSearchError(error)
	}

	const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
		try {
			await updateTask(boardID, taskId, updates)
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
			loadTasks()
		} catch (err) {
			console.error('Failed to delete task:', err)
			addToast('Failed to delete task', 'error')
		}
	}

	const openTaskModal = (task?: Task) => {
		setSelectedTask(task || null)
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
							{search && ` • Searching for "${search}"`}
						</p>
					</div>

					<button
						onClick={() => openTaskModal()}
						className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2'
					>
						<span>+</span>
						<span>Add Task</span>
					</button>
				</div>

				{/* Controls Bar */}
				<div className='flex flex-wrap gap-4 items-center justify-between p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-200/50'>
					<SearchBar
						value={search}
						onChange={setSearch}
						placeholder='Search tasks...'
						onSearchError={handleSearchError}
					/>

					<div className='flex items-center gap-3'>
						<FilterDropdown filters={filters} onFiltersChange={setFilters} />
						<SortSelect value={sort} onChange={setSort} />
						<ViewSwitch mode={viewMode} onChange={setViewMode} />

						<button
							onClick={loadTasks}
							className='p-2 rounded-xl border border-gray-200 bg-white/70 hover:bg-white/90 transition-all duration-200'
							title='Refresh tasks'
							disabled={loading}
						>
							{loading ? '⏳' : '🔄'}
						</button>
					</div>
				</div>
			</div>

			{/* Search Error State */}
			{searchError && (
				<div className='mb-6 p-4 rounded-2xl bg-yellow-50 border border-yellow-200'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-yellow-800 font-medium'>{searchError}</p>
							{search && (
								<button
									onClick={() => setSearch('')}
									className='mt-2 text-yellow-700 hover:text-yellow-900 text-sm'
								>
									Clear search
								</button>
							)}
						</div>
						<button
							onClick={() => setSearchError(null)}
							className='text-yellow-600 hover:text-yellow-800'
						>
							✕
						</button>
					</div>
				</div>
			)}

			{/* General Error State */}
			{error && !searchError && (
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
			{loading && (
				<div className='text-center py-8'>
					<div className='text-gray-600'>
						{search ? 'Searching tasks...' : 'Loading tasks...'}
					</div>
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
									onAddTask={() => openTaskModal()}
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
										{searchError ? 'No tasks found' : 'No tasks yet'}
									</h3>
									<p className='text-gray-600 mb-6'>
										{search
											? 'Try adjusting your search query'
											: filters.status || filters.priority || filters.deadline
											? 'Try adjusting your filters'
											: 'Create your first task to get started'}
									</p>
									<button
										onClick={() => openTaskModal()}
										className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
									>
										Create First Task
									</button>
								</div>
							) : (
								tasks.map(task => (
									<TaskCard
										key={task.id}
										task={task}
										onUpdate={handleUpdateTask}
										onDelete={handleDeleteTask}
										onClick={openTaskModal}
									/>
								))
							)}
						</div>
					)}
				</>
			)}

			{/* Task Modal */}
			<TaskModal
				open={taskModalOpen}
				onClose={() => {
					setTaskModalOpen(false)
					setSelectedTask(null)
				}}
				boardID={boardID}
				task={selectedTask}
				mode={selectedTask ? 'edit' : 'create'}
				onTaskUpdate={loadTasks}
				onDelete={handleDeleteTask}
			/>
		</div>
	)
}
