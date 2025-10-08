import React from 'react'
import type { Task } from '../types/board'
import TaskCard from './TaskCard'

interface KanbanColumnProps {
	title: string
	status: string
	tasks: Task[]
	onTaskUpdate: (taskId: number, updates: Partial<Task>) => void
	onAddTask?: (status: string) => void
}

export default function KanbanColumn({
	title,
	status,
	tasks,
	onTaskUpdate,
	onAddTask,
}: KanbanColumnProps) {
	return (
		<div className='flex-1 min-w-80 bg-gray-50/50 rounded-2xl p-4 backdrop-blur-md border border-gray-200/50'>
			{/* Column Header */}
			<div className='flex justify-between items-center mb-4'>
				<div>
					<h3 className='font-semibold text-gray-900'>{title}</h3>
					<span className='text-sm text-gray-500'>{tasks.length} tasks</span>
				</div>
				<button
					onClick={() => onAddTask?.(status)}
					className='w-8 h-8 rounded-full bg-white/70 backdrop-blur-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-sm transition-all duration-200'
				>
					+
				</button>
			</div>

			{/* Tasks */}
			<div className='space-y-3'>
				{tasks.map(task => (
					<div
						key={task.id}
						draggable
						onDragStart={e => {
							e.dataTransfer.setData('taskId', task.id.toString())
						}}
						className='cursor-move'
					>
						<TaskCard task={task} onUpdate={onTaskUpdate} />
					</div>
				))}

				{tasks.length === 0 && (
					<div className='text-center py-8 text-gray-400 text-sm'>
						No tasks in this column
					</div>
				)}
			</div>
		</div>
	)
}
