import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import BoardCard from '../components/BoardCard'
import { getBoards, createBoard, updateBoard, deleteBoard } from '../api/board'
import type { Board } from '../types/board'
import SearchBar from '../components/SearchBar'
import { useAuthStore } from '../store/auth'
import { useToast } from '../hooks/useToast'
import { useModal } from '../hooks/useModal'

export default function Dashboard() {
	const navigate = useNavigate()
	const [boards, setBoards] = useState<Board[]>([])
	const [filteredBoards, setFilteredBoards] = useState<Board[]>([])
	const [search, setSearch] = useState('')
	const [boardModalOpen, setBoardModalOpen] = useState(false)
	const [newBoardName, setNewBoardName] = useState('')
	const [loading, setLoading] = useState(true)
	const [creating, setCreating] = useState(false)
	const [editingBoard, setEditingBoard] = useState<Board | null>(null)
	const [editedName, setEditedName] = useState('')
	const token = useAuthStore(s => s.accessToken)
	const { addToast } = useToast()
	const { openLogin } = useModal()

	const loadBoards = useCallback(async () => {
		if (!token) {
			setLoading(false)
			return
		}

		setLoading(true)
		try {
			const data = await getBoards()
			setBoards(Array.isArray(data) ? data : [])
			window.dispatchEvent(new CustomEvent('boards:loaded', { detail: data }))
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
		const handler = () => setBoardModalOpen(true)
		window.addEventListener('open:createBoard', handler)
		return () => window.removeEventListener('open:createBoard', handler)
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

	const handleCreateBoardClick = () => {
		if (!token) {
			addToast('Please login to create a board', 'info')
			openLogin()
			return
		}
		setBoardModalOpen(true)
	}

	const handleCreateBoard = async () => {
		if (!newBoardName.trim()) {
			addToast('Please enter a board name', 'error')
			return
		}

		setCreating(true)
		try {
			const board = await createBoard(newBoardName.trim())
			setBoards(prev => [board, ...prev])
			window.dispatchEvent(new CustomEvent('board:created', { detail: board }))
			setNewBoardName('')
			setBoardModalOpen(false)
			addToast('Board created successfully', 'success')
		} catch (err) {
			console.error('Failed to create board:', err)
			addToast('Cannot create board', 'error')
		} finally {
			setCreating(false)
		}
	}

	const handleEditBoard = async () => {
		if (!editingBoard || !editedName.trim()) return
		try {
			const updated = await updateBoard(editingBoard.id, {
				name: editedName.trim(),
			})
			setBoards(prev =>
				prev.map(b =>
					b.id === editingBoard.id ? { ...b, name: updated.name } : b
				)
			)
			window.dispatchEvent(
				new CustomEvent('board:updated', { detail: updated })
			)
			addToast('Board renamed successfully', 'success')
			setEditingBoard(null)
			setEditedName('')
		} catch (err) {
			console.error('Failed to update board:', err)
			addToast('Cannot rename board', 'error')
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
			window.dispatchEvent(
				new CustomEvent('board:deleted', { detail: boardId })
			)
		} catch (err) {
			console.error('Failed to delete board:', err)
			addToast('Cannot delete board', 'error')
		}
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<div className='text-center'>
					<div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
					<div className='text-gray-600'>Loading boards...</div>
				</div>
			</div>
		)
	}

	return (
		<div className='max-w-7xl mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex justify-between items-start mb-6'>
					<div>
						<h1 className='text-2xl font-bold text-gray-900'>My Boards</h1>
						<p className='text-gray-600 mt-1'>
							{boards && boards.length > 0
								? `${boards.length} board${
										boards.length !== 1 ? 's' : ''
								  } available`
								: 'Create your first board to get started'}
						</p>
					</div>
					<div className='flex gap-3'>
						<button
							onClick={loadBoards}
							className='flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200'
							disabled={loading}
						>
							{loading ? (
								<div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin'></div>
							) : (
								<svg
									className='w-4 h-4 hover:rotate-180 transition-transform duration-300'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
									/>
								</svg>
							)}
							<span className='hidden sm:block'>Refresh</span>
						</button>
						<button
							onClick={handleCreateBoardClick}
							className='flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
						>
							<svg
								className='w-4 h-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 4v16m8-8H4'
								/>
							</svg>
							<span>New Board</span>
						</button>
					</div>
				</div>

				{/* Search */}
				<div className='max-w-md'>
					<SearchBar
						value={search}
						onChange={setSearch}
						placeholder='Search boards by name...'
					/>
				</div>
			</div>

			{/* Content */}
			{!token ? (
				<div className='text-center py-16'>
					<div className='w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center'>
						<svg
							className='w-12 h-12 text-blue-500'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 6v6m0 0v6m0-6h6m-6 0H6'
							/>
						</svg>
					</div>
					<h2 className='text-2xl font-bold text-gray-900 mb-3'>
						Welcome to TaskTracker
					</h2>
					<p className='text-gray-600 mb-8 max-w-md mx-auto'>
						Please login or sign up to create and manage your boards and tasks.
					</p>
					<button
						onClick={openLogin}
						className='px-8 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
					>
						Get Started
					</button>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filteredBoards.length === 0 ? (
						<div className='col-span-full text-center py-16'>
							<div className='w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center'>
								<svg
									className='w-12 h-12 text-blue-500'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 6v6m0 0v6m0-6h6m-6 0H6'
									/>
								</svg>
							</div>
							<h3 className='text-2xl font-bold text-gray-900 mb-3'>
								No boards yet
							</h3>
							<p className='text-gray-600 mb-6 text-lg'>
								Create your first board to get started
							</p>
							<button
								onClick={handleCreateBoardClick}
								className='px-8 py-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 text-lg'
							>
								Create Your First Board
							</button>
						</div>
					) : (
						<>
							{filteredBoards.map(board => (
								<BoardCard
									key={board.id}
									board={board}
									onDelete={handleDeleteBoard}
									onEdit={() => {
										setEditingBoard(board)
										setEditedName(board.name)
									}}
									onOpen={() => navigate(`/boards/${board.id}`)}
								/>
							))}

							{/* Card for NewBoard */}
							<div
								className='border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all duration-300 group min-h-[300px]'
								onClick={handleCreateBoardClick}
							>
								<div className='w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300 flex items-center justify-center mb-4'>
									<svg
										className='w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors duration-300'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 4v16m8-8H4'
										/>
									</svg>
								</div>
								<h3 className='text-lg font-semibold text-gray-700 mb-2'>
									Add New Board
								</h3>
								<p className='text-gray-500 text-sm text-center'>
									Create a new board to organize your tasks and projects
								</p>
							</div>
						</>
					)}
				</div>
			)}

			{/* Rename board modal */}
			{editingBoard && (
				<div className='fixed inset-0 z-50 flex items-center justify-center'>
					<div
						className='absolute inset-0 bg-black/40 backdrop-blur-sm'
						onClick={() => setEditingBoard(null)}
					/>
					<div className='relative w-full max-w-md p-6 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl z-10'>
						<h3 className='text-lg font-semibold mb-4'>Rename Board</h3>
						<div className='space-y-4'>
							<input
								value={editedName}
								onChange={e => setEditedName(e.target.value)}
								placeholder='Enter new name...'
								className='w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								onKeyDown={e => e.key === 'Enter' && handleEditBoard()}
								autoFocus
							/>
							<div className='flex gap-2'>
								<button
									onClick={handleEditBoard}
									className='flex-1 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
								>
									Save
								</button>
								<button
									onClick={() => setEditingBoard(null)}
									className='px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200'
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Create Board Modal */}
			{boardModalOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center'>
					<div
						className='absolute inset-0 bg-black/40 backdrop-blur-sm'
						onClick={() => setBoardModalOpen(false)}
					/>
					<div className='relative w-full max-w-md p-6 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl z-10'>
						<h3 className='text-lg font-semibold mb-4'>Create New Board</h3>
						<div className='space-y-4'>
							<input
								value={newBoardName}
								onChange={e => setNewBoardName(e.target.value)}
								placeholder='Enter board name...'
								className='w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								onKeyDown={e => e.key === 'Enter' && handleCreateBoard()}
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
									className='px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200'
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
