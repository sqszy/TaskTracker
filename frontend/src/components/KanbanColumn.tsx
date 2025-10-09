import React from 'react'
import type { Task, TaskStatus } from '../types/board'
import TaskCard from './TaskCard'

interface KanbanColumnProps {
	title: string
	status: TaskStatus
	tasks: Task[]
	color?: string
	onTaskUpdate: (taskId: number, updates: Partial<Task>) => void
	onTaskClick: (task: Task) => void
	onAddTask: () => void
}

export default function KanbanColumn({
	title,
	status,
	tasks,
	color = 'bg-gray-100',
	onTaskUpdate,
	onTaskClick,
	onAddTask,
}: KanbanColumnProps) {
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		const taskId = e.dataTransfer.getData('taskId')
		if (taskId) {
			onTaskUpdate(Number(taskId), { status })
		}
	}

	return (
		<div
			className='flex-1 min-w-80 bg-gray-50/50 rounded-2xl p-4 backdrop-blur-md border border-gray-200/50 relative z-10'
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{/* Column Header */}
			<div className='flex justify-between items-center mb-4'>
				<div className='flex items-center gap-3'>
					<div className={`w-3 h-3 rounded-full ${color.split(' ')[0]}`}></div>
					<div>
						<h3 className='font-semibold text-gray-900'>{title}</h3>
						<span className='text-sm text-gray-500'>{tasks.length} tasks</span>
					</div>
				</div>
				<button
					onClick={onAddTask}
					className='w-8 h-8 rounded-full bg-white/70 backdrop-blur-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-sm transition-all duration-200'
					title={`Add task to ${title}`}
				>
					+
				</button>
			</div>

			{/* Tasks */}
			<div className='space-y-3 min-h-[200px]'>
				{tasks.map(task => (
					<div
						key={task.id}
						draggable
						onDragStart={e => {
							e.dataTransfer.setData('taskId', task.id.toString())
						}}
					>
						<TaskCard
							task={task}
							onUpdate={onTaskUpdate}
							onDelete={() => {}} // Empty function for now since we handle delete in modal
							onClick={onTaskClick}
						/>
					</div>
				))}

				{tasks.length === 0 && (
					<div
						className='text-center py-8 text-gray-400 text-sm rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors duration-200'
						onClick={onAddTask}
					>
						+ Add task to {title}
					</div>
				)}
			</div>
		</div>
	)
}
