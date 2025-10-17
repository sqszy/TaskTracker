import { useEffect, useState } from 'react'
import { getBoards } from '../api/board'
import { getTasksByBoard } from '../api/tasks'
import type { Task } from '../types/board'
import { useAuthStore } from '../store/auth'
import { useToast } from '../hooks/useToast'
import {
	format,
	eachDayOfInterval,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	isSameDay,
	isSameMonth,
	addMonths,
	subMonths,
} from 'date-fns'
import { enUS } from 'date-fns/locale'

export default function CalendarPage() {
	const [tasks, setTasks] = useState<Task[]>([])
	const [currentMonth, setCurrentMonth] = useState(new Date())
	const [days, setDays] = useState<Date[]>([])
	const { accessToken } = useAuthStore(s => s)
	const { addToast } = useToast()
	const today = new Date()

	const [tooltip, setTooltip] = useState<{
		visible: boolean
		x: number
		y: number
		items: Task[]
	}>({ visible: false, x: 0, y: 0, items: [] })

	useEffect(() => {
		const loadTasks = async () => {
			try {
				const boards = await getBoards()
				const allTasks: Task[] = []
				for (const board of boards || []) {
					const boardTasks = (await getTasksByBoard(board.id)) || []
					allTasks.push(...boardTasks)
				}
				setTasks(allTasks)
			} catch (err) {
				console.error(err)
				addToast('Failed to load tasks', 'error')
			}
		}
		if (accessToken) loadTasks()
	}, [accessToken, addToast])

	useEffect(() => {
		const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
		const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
		setDays(eachDayOfInterval({ start, end }))
	}, [currentMonth])

	const getTasksForDay = (day: Date) => {
		return tasks.filter(task => {
			if (!task.deadline) return false
			const deadline = new Date(task.deadline)
			return isSameDay(deadline, day)
		})
	}

	const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
	const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

	const showTooltip = (e: React.MouseEvent, items: Task[]) => {
		const target = e.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()
		const x = rect.left + rect.width / 2
		const y = rect.bottom + 8
		setTooltip({ visible: true, x, y, items })
	}

	const hideTooltip = () => {
		setTooltip(prev => ({ ...prev, visible: false }))
	}

	return (
		<div className='max-w-6xl mx-auto'>
			{/* Header */}
			<div className='flex justify-between items-center mb-10'>
				<div>
					<h1 className='text-4xl font-bold text-gray-900/90 mb-1 drop-shadow-sm'>
						Calendar
					</h1>
					<p className='text-gray-600/80 text-sm tracking-wide'></p>
				</div>

				<div className='flex items-center gap-3'>
					<button
						onClick={handlePrevMonth}
						className='px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/50 transition-all duration-200'
					>
						←
					</button>
					<span className='font-semibold text-lg text-gray-800/90 bg-white/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/50 shadow-inner'>
						{format(currentMonth, 'MMMM yyyy', { locale: enUS })}
					</span>
					<button
						onClick={handleNextMonth}
						className='px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/50 transition-all duration-200'
					>
						→
					</button>
				</div>
			</div>

			{/* Calendar */}
			<div className='grid grid-cols-7 gap-3 bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-2xl rounded-3xl p-6 border border-white/40 shadow-[0_4px_40px_rgba(0,0,0,0.05)]'>
				{/* Header days (Mon..Sun) */}
				{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
					<div
						key={day}
						className='text-center font-semibold text-gray-700 uppercase text-sm pb-2 border-b border-white/40'
					>
						{day}
					</div>
				))}

				{/* Day cells */}
				{days.map(day => {
					const dayTasks = getTasksForDay(day)
					const isCurrentMonth = isSameMonth(day, currentMonth)
					const isToday = isSameDay(day, today)

					return (
						<div
							key={day.toISOString()}
							onMouseEnter={e => showTooltip(e, dayTasks)}
							onMouseLeave={hideTooltip}
							className={`relative flex flex-col items-start rounded-2xl p-3 h-28 cursor-pointer transition-all duration-300 ${
								isCurrentMonth
									? 'bg-white/40 backdrop-blur-md border border-white/60 hover:shadow-lg hover:-translate-y-1 hover:border-blue-400/60'
									: 'bg-white/20 border border-white/40 text-gray-400 backdrop-blur-sm opacity-40'
							} ${
								isToday
									? 'ring-2 ring-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.25)] scale-[1.02]'
									: ''
							}`}
						>
							<div className='w-full flex justify-between items-center'>
								<span
									className={`font-medium ${
										isToday ? 'text-blue-600 font-bold' : 'text-gray-700'
									}`}
								>
									{format(day, 'd')}
								</span>

								{dayTasks.length > 0 && (
									<div className='w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs flex items-center justify-center shadow-md'>
										{dayTasks.length}
									</div>
								)}
							</div>

							{/* Show a couple of task */}
							{dayTasks.length > 0 && (
								<div className='mt-2 w-full space-y-1'>
									{dayTasks.slice(0, 2).map(t => (
										<div
											key={t.id}
											className='text-xs text-gray-700 truncate w-full'
										>
											• {t.title}
										</div>
									))}
									{dayTasks.length > 2 && (
										<div className='text-xs text-gray-500'>
											+{dayTasks.length - 2} more
										</div>
									)}
								</div>
							)}
						</div>
					)
				})}
			</div>

			{/* Tooltip */}
			{tooltip.visible && tooltip.items.length > 0 && (
				<div
					className='fixed z-[99999] p-3 bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-xl w-64 max-h-64 overflow-auto'
					style={{
						left: tooltip.x,
						top: tooltip.y,
						transform: 'translateX(-50%)',
					}}
					onMouseEnter={() => setTooltip(prev => ({ ...prev, visible: true }))}
					onMouseLeave={hideTooltip}
				>
					<p className='text-sm font-semibold text-gray-800 mb-2'>Tasks</p>
					<ul className='space-y-2'>
						{tooltip.items.map(task => (
							<li key={task.id} className='text-sm text-gray-700 truncate'>
								<div className='flex justify-between items-center'>
									<span className='truncate'>{task.title}</span>
									{task.priority && (
										<span className='text-xs text-gray-500 ml-2'>
											{task.priority}
										</span>
									)}
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}
