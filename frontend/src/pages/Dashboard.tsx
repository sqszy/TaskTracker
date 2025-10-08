import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BoardCard from '../components/BoardCard'
import BoardDetailModal from '../components/BoardDetailModal'
import { getBoards, createBoard, deleteBoard } from '../api/board'
import type { Board } from '../types/board'
import SearchBar from '../components/SearchBar'

export default function Dashboard() {
	const navigate = useNavigate()
	const [boards, setBoards] = useState<Board[]>([])
	const [filteredBoards, setFilteredBoards] = useState<Board[]>([])
	const [search, setSearch] = useState('')
	const [boardModalOpen, setBoardModalOpen] = useState(false)
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [selectedBoard, setSelectedBoard] = useState<{
		id?: number
		name?: string
	}>({})
	const [newBoardName, setNewBoardName] = useState('')

	useEffect(() => {
		loadBoards()
	}, [])

	useEffect(() => {
		if (search.trim()) {
			const filtered = boards.filter(board =>
				board.name.toLowerCase().includes(search.toLowerCase())
			)
			setFilteredBoards(filtered)
		} else {
			setFilteredBoards(boards)
		}
	}, [search, boards])

	const loadBoards = async () => {
		try {
			const data = await getBoards()
			setBoards(data)
		} catch (err) {
			console.error('Failed to load boards:', err)
		}
	}

	const handleCreateBoard = async () => {
		if (!newBoardName.trim()) return

		try {
			const board = await createBoard(newBoardName.trim())
			setBoards(prev => [board, ...prev])
			setNewBoardName('')
			setBoardModalOpen(false)
		} catch (err) {
			console.error('Failed to create board:', err)
			alert('Cannot create board')
		}
	}

	const handleDeleteBoard = async (boardId: number) => {
		if (
			!confirm(
				'Are you sure you want to delete this board? All tasks will be lost.'
			)
		)
			return

		try {
			await deleteBoard(boardId)
			setBoards(prev => prev.filter(board => board.id !== boardId))
		} catch (err) {
			console.error('Failed to delete board:', err)
		}
	}

	const openBoardDetail = (id: number, name: string) => {
		setSelectedBoard({ id, name })
		setDetailModalOpen(true)
	}

	const openFullBoard = (id: number) => {
		navigate(`/boards/${id}`)
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30'>
			<Navbar />

			<main className='p-6 max-w-6xl mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex justify-between items-center mb-6'>
						<h1 className='text-3xl font-bold text-gray-900'>My Boards</h1>
						<button
							onClick={() => setBoardModalOpen(true)}
							className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
						>
							+ New Board
						</button>
					</div>

					{/* Search Bar */}
					<div className='max-w-md'>
						<SearchBar
							value={search}
							onChange={setSearch}
							placeholder='Search boards by name...'
						/>
					</div>
				</div>

				{/* Boards Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{filteredBoards.map(board => (
						<div key={board.id} className='relative group'>
							<BoardCard
								board={board}
								onOpen={openBoardDetail}
								onOpenFull={openFullBoard}
							/>
							<button
								onClick={() => handleDeleteBoard(board.id)}
								className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110'
							>
								×
							</button>
						</div>
					))}

					{filteredBoards.length === 0 && (
						<div className='col-span-full text-center py-12'>
							<div className='text-gray-400 text-lg mb-4'>
								{search
									? 'No boards found matching your search'
									: 'No boards yet'}
							</div>
							<button
								onClick={() => setBoardModalOpen(true)}
								className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
							>
								Create Your First Board
							</button>
						</div>
					)}
				</div>
			</main>

			{/* Create Board Modal */}
			{boardModalOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center'>
					<div
						className='absolute inset-0 bg-black/40'
						onClick={() => setBoardModalOpen(false)}
					/>
					<div className='relative w-full max-w-md p-6 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl z-10'>
						<h3 className='text-lg font-semibold mb-4'>Create New Board</h3>
						<div className='space-y-4'>
							<input
								value={newBoardName}
								onChange={e => setNewBoardName(e.target.value)}
								placeholder='Board name'
								className='w-full p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								onKeyPress={e => e.key === 'Enter' && handleCreateBoard()}
							/>
							<div className='flex gap-2'>
								<button
									onClick={handleCreateBoard}
									className='flex-1 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
								>
									Create Board
								</button>
								<button
									onClick={() => setBoardModalOpen(false)}
									className='px-6 py-3 rounded-xl border border-gray-200 bg-white/70 hover:bg-white/90 transition-all duration-200'
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Board Detail Modal */}
			<BoardDetailModal
				open={detailModalOpen}
				onClose={() => setDetailModalOpen(false)}
				boardID={selectedBoard.id}
				boardName={selectedBoard.name}
			/>
		</div>
	)
}
