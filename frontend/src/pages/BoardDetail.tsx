import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
	getTasks,
	createTask,
	updateTask,
	deleteTask,
	type GetTasksParams,
} from '../api/tasks'
import type { Task, ViewMode, SortOption } from '../types/board'
import SearchBar from '../components/SearchBar'
import FilterDropdown from '../components/FilterDropdown'
import SortSelect from '../components/SortSelect'
import ViewSwitch from '../components/ViewSwitch'
import TaskCard from '../components/TaskCard'
import KanbanColumn from '../components/KanbanColumn'

interface Filters {
	status: string
	priority: string
	deadline: 'with' | 'without' | ''
}

const STATUS_OPTIONS = [
	{ value: 'todo', label: 'To Do' },
	{ value: 'in_progress', label: 'In Progress' },
	{ value: 'need_review', label: 'Need Review' },
	{ value: 'done', label: 'Done' },
]

export default function BoardDetail() {
	const { id } = useParams<{ id: string }>()
	const boardID = Number(id)

	const [tasks, setTasks] = useState<Task[]>([])
	const [search, setSearch] = useState('')
	const [filters, setFilters] = useState<Filters>({
		status: '',
		priority: '',
		deadline: '',
	})
	const [sort, setSort] = useState<SortOption>('newest')
	const [viewMode, setViewMode] = useState<ViewMode>('board')

	const [newTask, setNewTask] = useState({
		title: '',
		description: '',
		status: 'todo',
		priority: 'medium',
		deadline: '',
	})

	// Load tasks with filters
	const loadTasks = useCallback(async () => {
		if (!boardID) return

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
			setTasks(data)
		} catch (err) {
			console.error('Failed to load tasks:', err)
		}
	}, [boardID, search, filters, sort])

	useEffect(() => {
		loadTasks()
	}, [loadTasks])

	const handleCreateTask = async () => {
		if (!newTask.title.trim()) return

		try {
			const task = await createTask(
				boardID,
				newTask.title.trim(),
				newTask.description,
				newTask.status,
				newTask.priority,
				newTask.deadline || undefined
			)

			setTasks(prev => [task, ...prev])
			setNewTask({
				title: '',
				description: '',
				status: 'todo',
				priority: 'medium',
				deadline: '',
			})
		} catch (err) {
			console.error('Failed to create task:', err)
			alert('Cannot create task')
		}
	}

	const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
		try {
			const updatedTask = await updateTask(boardID, taskId, updates)
			setTasks(prev =>
				prev.map(task => (task.id === taskId ? updatedTask : task))
			)
		} catch (err) {
			console.error('Failed to update task:', err)
		}
	}

	const handleDeleteTask = async (taskId: number) => {
		if (!confirm('Are you sure you want to delete this task?')) return

		try {
			await deleteTask(boardID, taskId)
			setTasks(prev => prev.filter(task => task.id !== taskId))
		} catch (err) {
			console.error('Failed to delete task:', err)
		}
	}

	// Group tasks by status for Kanban view
	const tasksByStatus = STATUS_OPTIONS.reduce((acc, status) => {
		acc[status.value] = tasks.filter(task => task.status === status.value)
		return acc
	}, {} as Record<string, Task[]>)

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30'>
			<Navbar />

			<main className='p-6 max-w-7xl mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>
						Board {boardID}
					</h1>

					{/* Controls Bar */}
					<div className='flex flex-wrap gap-4 items-center justify-between p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-200/50'>
						<SearchBar
							value={search}
							onChange={setSearch}
							placeholder='Search tasks...'
						/>

						<div className='flex items-center gap-3'>
							<FilterDropdown filters={filters} onFiltersChange={setFilters} />
							<SortSelect value={sort} onChange={setSort} />
							<ViewSwitch mode={viewMode} onChange={setViewMode} />
						</div>
					</div>
				</div>

				{/* Add Task Form */}
				<div className='mb-8 p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm border border-gray-200/50'>
					<h3 className='text-lg font-semibold mb-4 text-gray-900'>
						Add New Task
					</h3>
					<div className='grid grid-cols-1 lg:grid-cols-5 gap-4'>
						<input
							value={newTask.title}
							onChange={e =>
								setNewTask(prev => ({ ...prev, title: e.target.value }))
							}
							placeholder='Task title'
							className='lg:col-span-2 p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
						<input
							value={newTask.description}
							onChange={e =>
								setNewTask(prev => ({ ...prev, description: e.target.value }))
							}
							placeholder='Description'
							className='p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
						<select
							value={newTask.status}
							onChange={e =>
								setNewTask(prev => ({ ...prev, status: e.target.value }))
							}
							className='p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						>
							{STATUS_OPTIONS.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<div className='flex gap-2'>
							<input
								type='date'
								value={newTask.deadline}
								onChange={e =>
									setNewTask(prev => ({ ...prev, deadline: e.target.value }))
								}
								className='flex-1 p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
							<button
								onClick={handleCreateTask}
								className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
							>
								Add
							</button>
						</div>
					</div>
				</div>

				{/* Tasks View */}
				{viewMode === 'board' ? (
					// Kanban Board View
					<div className='flex gap-6 overflow-x-auto pb-6'>
						{STATUS_OPTIONS.map(status => (
							<KanbanColumn
								key={status.value}
								title={status.label}
								status={status.value}
								tasks={tasksByStatus[status.value] || []}
								onTaskUpdate={handleUpdateTask}
								onAddTask={status => {
									setNewTask(prev => ({ ...prev, status }))
									// Focus on title input
									const titleInput = document.querySelector(
										'input[placeholder="Task title"]'
									) as HTMLInputElement
									titleInput?.focus()
								}}
							/>
						))}
					</div>
				) : (
					// List/Timeline View
					<div
						className={`grid gap-4 ${
							viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
						}`}
					>
						{tasks.map(task => (
							<TaskCard
								key={task.id}
								task={task}
								onUpdate={handleUpdateTask}
								onDelete={handleDeleteTask}
							/>
						))}

						{tasks.length === 0 && (
							<div className='col-span-full text-center py-12 text-gray-500'>
								No tasks found. Create your first task!
							</div>
						)}
					</div>
				)}
			</main>
		</div>
	)
}
