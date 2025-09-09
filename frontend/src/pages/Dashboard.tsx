import { useEffect, useState } from 'react'
import { getBoards, createBoard } from '../api/board'
import type { Board } from '../types/board'
import BoardCard from '../components/BoardCard'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
	const [boards, setBoards] = useState<Board[]>([])
	const [loading, setLoading] = useState(true)
	const [showCreate, setShowCreate] = useState(false)
	const [newName, setNewName] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		setLoading(true)
		getBoards()
			.then(b => setBoards(b || []))
			.catch(err => {
				console.error(err)
				navigate('/login')
			})
			.finally(() => setLoading(false))
	}, [navigate])

	const onCreate = async () => {
		if (!newName.trim()) return
		try {
			const created = await createBoard(newName.trim())
			setBoards(s => [created, ...s])
			setNewName('')
			setShowCreate(false)
		} catch (err) {
			console.error('Create board failed', err)
			alert('Cannot create board')
		}
	}

	return (
		<div className="min-h-screen bg-[url('/public/tiles.svg')] bg-gray-50">
			<Navbar />
			<main className='p-6 max-w-6xl mx-auto'>
				<div className='flex items-center justify-between mb-6'>
					<h1 className='text-2xl font-bold'>Boards</h1>
					<div>
						<button
							onClick={() => setShowCreate(v => !v)}
							className='px-4 py-2 rounded-full bg-white/90 shadow'
						>
							+ Create Board
						</button>
					</div>
				</div>

				{showCreate && (
					<div className='mb-6'>
						<input
							value={newName}
							onChange={e => setNewName(e.target.value)}
							placeholder='Board name'
							className='p-2 rounded-l-lg border'
						/>
						<button
							onClick={onCreate}
							className='p-2 bg-blue-500 text-white rounded-r-lg'
						>
							Create
						</button>
					</div>
				)}

				{loading ? (
					<p>Loading...</p>
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
						{boards.map(b => (
							<BoardCard key={b.id} board={b} />
						))}
					</div>
				)}
			</main>
		</div>
	)
}
