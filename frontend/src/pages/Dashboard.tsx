// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react'
import { getBoards, createBoard } from '../api/board'
import type { Board } from '../types/board'
import BoardCard from '../components/BoardCard'
import Navbar from '../components/Navbar'
import BoardDetailModal from '../components/BoardDetailModal'
import { useAuthStore } from '../store/auth'
import LoginModal from '../components/LoginModal'

export default function Dashboard() {
	const [boards, setBoards] = useState<Board[]>([])
	const [loading, setLoading] = useState(true)
	const [createOpen, setCreateOpen] = useState(false)
	const [newName, setNewName] = useState('')
	const [detailOpen, setDetailOpen] = useState(false)
	const [detailBoardID, setDetailBoardID] = useState<number | undefined>(
		undefined
	)
	const [detailBoardName, setDetailBoardName] = useState<string | undefined>(
		undefined
	)
	const [loginOpen, setLoginOpen] = useState(false)

	const token = useAuthStore(s => s.accessToken)

	useEffect(() => {
		setLoading(true)
		getBoards()
			.then(b => setBoards(b || []))
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [])

	const onCreateClick = () => {
		if (!token) {
			setLoginOpen(true)
			return
		}
		setCreateOpen(true)
	}

	const create = async () => {
		if (!newName.trim()) return
		try {
			const created = await createBoard(newName.trim())
			setBoards(s => [created, ...s])
			setNewName('')
			setCreateOpen(false)
		} catch (e) {
			console.error(e)
			alert('Cannot create board')
		}
	}

	const openBoard = (id: number, name: string) => {
		if (!token) {
			setLoginOpen(true)
			return
		}
		setDetailBoardID(id)
		setDetailBoardName(name)
		setDetailOpen(true)
	}

	return (
		<div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100'>
			<Navbar />
			<main className='p-6 max-w-6xl mx-auto'>
				<div className='flex items-center justify-between mb-6'>
					<h1 className='text-3xl font-semibold'>Boards</h1>
					<div>
						<button
							onClick={onCreateClick}
							className='px-4 py-2 rounded-full bg-white/90 shadow'
						>
							+ Create Board
						</button>
					</div>
				</div>

				{createOpen && (
					<div className='mb-6 flex gap-2'>
						<input
							value={newName}
							onChange={e => setNewName(e.target.value)}
							placeholder='Board name'
							className='p-2 rounded-l-lg border flex-1 bg-white/70'
						/>
						<button
							onClick={create}
							className='p-2 bg-blue-500 text-white rounded-r-lg'
						>
							Create
						</button>
					</div>
				)}

				{loading ? (
					<p>Loading...</p>
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
						{boards.map(b => (
							<BoardCard key={b.id} board={b} onOpen={openBoard} />
						))}
					</div>
				)}
			</main>

			<BoardDetailModal
				open={detailOpen}
				onClose={() => setDetailOpen(false)}
				boardID={detailBoardID}
				boardName={detailBoardName}
			/>
			<LoginModal
				open={loginOpen}
				onClose={() => setLoginOpen(false)}
				openSignup={() => setLoginOpen(false)}
			/>
		</div>
	)
}
