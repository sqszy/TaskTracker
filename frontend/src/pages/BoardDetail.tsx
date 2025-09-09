import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getTasks, createTask } from '../api/tasks'
import type { Task } from '../types/board'

export default function BoardDetail() {
	const { id } = useParams<{ id: string }>()
	const boardID = Number(id)
	const [tasks, setTasks] = useState<Task[]>([])
	const [title, setTitle] = useState('')
	const [desc, setDesc] = useState('')

	useEffect(() => {
		if (!boardID) return
		getTasks(boardID).then(setTasks).catch(console.error)
	}, [boardID])

	const onCreate = async () => {
		if (!title.trim()) return
		try {
			const t = await createTask(boardID, title.trim(), desc)
			setTasks(s => [t, ...s])
			setTitle('')
			setDesc('')
		} catch (err) {
			console.error(err)
			alert('Cannot create task')
		}
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<Navbar />
			<main className='p-6 max-w-4xl mx-auto'>
				<h1 className='text-2xl font-bold mb-4'>Board {boardID}</h1>

				<div className='mb-4 flex gap-2'>
					<input
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder='Task title'
						className='p-2 rounded-l-lg border flex-1'
					/>
					<input
						value={desc}
						onChange={e => setDesc(e.target.value)}
						placeholder='Description'
						className='p-2 border'
					/>
					<button
						onClick={onCreate}
						className='p-2 bg-blue-500 text-white rounded-r-lg'
					>
						Add
					</button>
				</div>

				<div className='space-y-3'>
					{tasks.map(t => (
						<div
							key={t.id}
							className='p-4 rounded-lg bg-white/60 backdrop-blur-md shadow'
						>
							<div className='flex justify-between'>
								<h3 className='font-semibold'>{t.title}</h3>
								<span className='text-sm text-gray-500'>{t.status}</span>
							</div>
							{t.description && (
								<p className='text-sm text-gray-700 mt-1'>{t.description}</p>
							)}
						</div>
					))}
				</div>
			</main>
		</div>
	)
}
