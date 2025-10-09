import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import BoardCard from '../components/BoardCard'
import BoardDetailModal from '../components/BoardDetailModal'
import { getBoards, createBoard, deleteBoard } from '../api/board'
import type { Board } from '../types/board'
import SearchBar from '../components/SearchBar'
import { useAuthStore } from '../store/auth'
import { useModal } from '../hooks/useModal'
import { useToast } from '../hooks/useToast'

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
	const [loading, setLoading] = useState(true)
	const [creating, setCreating] = useState(false)
	const token = useAuthStore(s => s.accessToken)
	const { openLogin } = useModal()
	const { addToast } = useToast()

	const loadBoards = useCallback(async () => {
		if (!token) {
			setLoading(false)
			return
		}

		setLoading(true)
		try {
			const data = await getBoards()
			setBoards(data)
		} catch (err) {
			console.error('Failed to load boards:', err)
			addToast('Failed to load boards', 'error')
		} finally {
			setLoading(false)
		}
	}, [token, addToast])

	useEffect(() => {
		loadBoards()
	}, [loadBoards])

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

	const handleCreateBoard = async () => {
		if (!token) {
			addToast('Please login to create a board', 'error')
			return
		}

		if (!newBoardName.trim()) {
			addToast('Please enter a board name', 'error')
			return
		}

		setCreating(true)
		try {
			const board = await createBoard(newBoardName.trim())
			setBoards(prev => [board, ...prev])
			setNewBoardName('')
			setBoardModalOpen(false)
			addToast('Board created successfully', 'success')

			setTimeout(() => {
				loadBoards()
			}, 500)
		} catch (err) {
			console.error('Failed to create board:', err)
			addToast('Cannot create board', 'error')
		} finally {
			setCreating(false)
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
			addToast('Board deleted successfully', 'success')

			setTimeout(() => {
				loadBoards()
			}, 300)
		} catch (err) {
			console.error('Failed to delete board:', err)
			addToast('Cannot delete board', 'error')
		}
	}

	const openBoardDetail = (id: number, name: string) => {
		if (!token) {
			addToast('Please login to view board details', 'error')
			return
		}
		setSelectedBoard({ id, name })
		setDetailModalOpen(true)
	}

	const openFullBoard = (id: number) => {
		if (!token) {
			addToast('Please login to view boards', 'error')
			return
		}
		navigate(`/boards/${id}`)
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[200px]'>
				<div className='text-lg text-gray-600'>Loading boards...</div>
			</div>
		)
	}

	return (
		<div className='max-w-6xl mx-auto'>
			{/* Компактный заголовок */}
			<div className='mb-6'>
				<div className='flex justify-between items-center mb-4'>
					<div>
						<h1 className='text-2xl font-bold text-gray-900'>My Boards</h1>
						<p className='text-gray-600 mt-1 text-sm'>
							{boards.length === 0
								? 'Create your first board to get started'
								: `${boards.length} board${
										boards.length !== 1 ? 's' : ''
								  } available`}
						</p>
					</div>
					<div className='flex gap-2'>
						<button
							onClick={loadBoards}
							className='px-3 py-2 rounded-xl border border-gray-200 bg-white/70 hover:bg-white/90 transition-all duration-200 text-sm'
						>
							🔄 Refresh
						</button>
						<button
							onClick={() => {
								if (!token) {
									addToast('Please login to create a board', 'error')
									return
								}
								setBoardModalOpen(true)
							}}
							className='px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 text-sm'
						>
							+ New Board
						</button>
					</div>
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
			{!token ? (
				<div className='text-center py-12'>
					<div className='text-4xl mb-3'>👋</div>
					<h2 className='text-xl font-bold text-gray-900 mb-3'>
						Welcome to TaskTracker
					</h2>
					<p className='text-gray-600 mb-6 max-w-md mx-auto text-sm'>
						Please login or sign up to create and manage your boards and tasks.
					</p>
					<button
						onClick={openLogin}
						className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
					>
						Get Started
					</button>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
					{filteredBoards.map(board => (
						<div key={board.id} className='relative group'>
							<BoardCard
								board={board}
								onOpen={openBoardDetail}
								onOpenFull={openFullBoard}
							/>
							<button
								onClick={() => handleDeleteBoard(board.id)}
								className='absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 flex items-center justify-center'
								title='Delete board'
							>
								×
							</button>
						</div>
					))}

					{/* Empty states */}
					{filteredBoards.length === 0 && boards.length > 0 && (
						<div className='col-span-full text-center py-8'>
							<div className='text-3xl mb-3'>🔍</div>
							<div className='text-gray-400 text-sm mb-3'>
								No boards found matching "{search}"
							</div>
							<button
								onClick={() => setSearch('')}
								className='px-3 py-2 rounded-xl border border-gray-200 bg-white/70 hover:bg-white/90 transition-all duration-200 text-sm'
							>
								Clear Search
							</button>
						</div>
					)}

					{boards.length === 0 && (
						<div className='col-span-full text-center py-8'>
							<div className='text-3xl mb-3'>📋</div>
							<div className='text-gray-400 text-sm mb-3'>
								You don't have any boards yet
							</div>
							<button
								onClick={() => setBoardModalOpen(true)}
								className='px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 text-sm'
							>
								Create Your First Board
							</button>
						</div>
					)}
				</div>
			)}

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
								placeholder='Enter board name...'
								className='w-full p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								onKeyPress={e => e.key === 'Enter' && handleCreateBoard()}
								autoFocus
							/>
							<div className='flex gap-2'>
								<button
									onClick={handleCreateBoard}
									disabled={creating}
									className='flex-1 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50'
								>
									{creating ? 'Creating...' : 'Create Board'}
								</button>
								<button
									onClick={() => setBoardModalOpen(false)}
									className='px-4 py-3 rounded-xl border border-gray-200 bg-white/70 hover:bg-white/90 transition-all duration-200'
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
				onTaskUpdate={loadBoards}
			/>
		</div>
	)
}
