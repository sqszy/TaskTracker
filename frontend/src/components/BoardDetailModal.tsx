import { useEffect, useState } from 'react'
import Modal from './Modal'
import { getTasks, createTask } from '../api/tasks'
import type { Task } from '../types/board'
import { useAuthStore } from '../store/auth'

export default function BoardDetailModal({
	open,
	onClose,
	boardID,
	boardName,
}: {
	open: boolean
	onClose: () => void
	boardID?: number
	boardName?: string
}) {
	const [tasks, setTasks] = useState<Task[]>([])
	const [title, setTitle] = useState('')
	const [desc, setDesc] = useState('')
	const token = useAuthStore(s => s.accessToken)

	useEffect(() => {
		if (!open || !boardID) return
		getTasks(boardID).then(setTasks).catch(console.error)
	}, [open, boardID])

	const add = async () => {
		if (!token) {
			alert('Please login to add tasks')
			return
		}
		if (!title.trim()) return
		try {
			const t = await createTask(boardID!, title.trim(), desc)
			setTasks(s => [t, ...s])
			setTitle('')
			setDesc('')
		} catch (e) {
			console.error(e)
			alert('Cannot add task')
		}
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={boardName || 'Board'}
			width='max-w-2xl'
		>
			<div className='space-y-4'>
				<div className='flex gap-2'>
					<input
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder='Task title'
						className='flex-1 p-2 rounded border bg-white/70'
					/>
					<input
						value={desc}
						onChange={e => setDesc(e.target.value)}
						placeholder='Description'
						className='p-2 rounded border bg-white/70 w-48'
					/>
					<button
						onClick={add}
						className='px-4 py-2 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white'
					>
						Add
					</button>
				</div>

				<div className='space-y-2 max-h-96 overflow-auto'>
					{tasks.length === 0 ? (
						<p className='text-sm text-gray-500'>No tasks yet</p>
					) : (
						tasks.map(t => (
							<div key={t.id} className='p-3 rounded-lg bg-white/60 shadow'>
								<div className='flex justify-between items-center'>
									<h4 className='font-semibold'>{t.title}</h4>
									<span className='text-xs text-gray-500'>{t.status}</span>
								</div>
								{t.description && (
									<p className='text-sm text-gray-700 mt-1'>{t.description}</p>
								)}
							</div>
						))
					)}
				</div>
			</div>
		</Modal>
	)
}
