import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { getBoards } from '../api/board'
import type { Board } from '../types/board'
import { useModal } from '../hooks/useModal'
import { useToast } from '../hooks/useToast'

interface SidebarProps {
	isOpen: boolean
	onClose: () => void
}

// SVG icons
const DashboardIcon = () => (
	<svg
		className='w-5 h-5'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
		/>
	</svg>
)

const CalendarIcon = () => (
	<svg
		className='w-5 h-5'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
		/>
	</svg>
)

const NotificationsIcon = () => (
	<svg
		className='w-5 h-5'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
		/>
	</svg>
)

const RefreshIcon = ({ loading = false }: { loading?: boolean }) =>
	loading ? (
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
	)

const BOARD_COLORS = [
	'bg-blue-500',
	'bg-green-500',
	'bg-rose-500',
	'bg-yellow-500',
	'bg-indigo-500',
	'bg-teal-500',
	'bg-purple-500',
	'bg-pink-500',
	'bg-orange-500',
	'bg-lime-500',
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const token = useAuthStore(s => s.accessToken)
	const clearTokens = useAuthStore(s => s.clear)
	const { openLogin, openSignup } = useModal()
	const { addToast } = useToast()
	const [boards, setBoards] = useState<Board[]>([])
	const [loading, setLoading] = useState(false)
	const [profileOpen, setProfileOpen] = useState(false)
	const [showAllBoards, setShowAllBoards] = useState(false)
	const userEmail = useAuthStore(s => s.userEmail) ?? ''

	const MAX_BOARDS_DISPLAY = 10
	const displayedBoards = showAllBoards
		? boards
		: boards.slice(0, MAX_BOARDS_DISPLAY)
	const hasMoreBoards = boards.length > MAX_BOARDS_DISPLAY

	const getUserAvatarUrl = () => {
		const seed = userEmail || Math.random().toString(36).slice(2, 9)
		return `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(
			seed
		)}&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
	}

	useEffect(() => {
		if (token && isOpen) {
			loadBoards()
		}
	}, [token, isOpen])

	useEffect(() => {
		const onBoardsLoaded = (e: Event) => {
			const detail = (e as CustomEvent).detail as Board[]
			if (Array.isArray(detail)) setBoards(detail)
		}
		const onBoardCreated = (e: Event) => {
			const newBoard = (e as CustomEvent).detail as Board
			if (!newBoard) return
			setBoards(prev => [newBoard, ...prev])
		}
		const onBoardDeleted = (e: Event) => {
			const id = (e as CustomEvent).detail as number
			setBoards(prev => prev.filter(b => b.id !== id))
		}

		window.addEventListener('boards:loaded', onBoardsLoaded)
		window.addEventListener('board:created', onBoardCreated)
		window.addEventListener('board:deleted', onBoardDeleted)

		return () => {
			window.removeEventListener('boards:loaded', onBoardsLoaded)
			window.removeEventListener('board:created', onBoardCreated)
			window.removeEventListener('board:deleted', onBoardDeleted)
		}
	}, [])

	const loadBoards = async () => {
		setLoading(true)
		try {
			const data = await getBoards()
			setBoards(Array.isArray(data) ? data : [])
		} catch (err) {
			console.error('Failed to load boards:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleLogin = () => {
		openLogin()
		onClose()
	}

	const handleSignup = () => {
		openSignup()
		onClose()
	}

	const handleLogout = () => {
		clearTokens()

		setBoards([])
		window.dispatchEvent(new CustomEvent('boards:loaded', { detail: [] }))

		navigate('/dashboard')
		addToast('You have been logged out')
		onClose()
		setProfileOpen(false)
	}

	const isActive = (path: string) => {
		return location.pathname === path
	}

	const handleCreateOne = () => {
		if (!token) {
			addToast('Please login to create a board', 'info')
			openLogin()
			return
		}
		window.dispatchEvent(new CustomEvent('open:createBoard'))
		onClose()
	}

	return (
		<>
			{/* Mobile Overlay */}
			{isOpen && (
				<div
					className='fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-glass'
					onClick={onClose}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`
				fixed lg:fixed inset-y-0 left-0 z-40
				w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200/50
				transform transition-transform duration-300 ease-in-out
				flex flex-col h-screen
				${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
			`}
			>
				{/* Header */}
				<div className='p-6 border-b border-gray-200/50 flex-shrink-0'>
					<div
						className='flex items-center gap-3 cursor-pointer group clickable force-clickable'
						onClick={() => {
							navigate('/dashboard')
							onClose()
						}}
					>
						<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
							<svg
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								className='text-white'
							>
								<path
									d='M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H15V18H3V16Z'
									fill='currentColor'
								/>
							</svg>
						</div>
						<div>
							<h1 className='text-lg font-bold text-gray-800'>TaskTracker</h1>
							<p className='text-xs text-gray-600'>Project Management</p>
						</div>
					</div>
				</div>

				{/* Main Navigation */}
				<nav className='flex-1 overflow-y-auto p-4'>
					<div className='mb-6'>
						<h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
							Navigation
						</h3>
						<div className='space-y-1'>
							{[
								{
									path: '/dashboard',
									icon: <DashboardIcon />,
									label: 'Dashboard',
								},
								{
									path: '/calendar',
									icon: <CalendarIcon />,
									label: 'Calendar',
								},
								{
									path: '/notifications',
									icon: <NotificationsIcon />,
									label: 'Notifications',
								},
							].map(item => (
								<button
									key={item.path}
									onClick={() => {
										navigate(item.path)
										onClose()
									}}
									className={`
                    w-full flex items-center gap-3 p-3 rounded-lg text-left
                    transition-all duration-200 font-medium force-clickable
                    ${
											isActive(item.path)
												? 'bg-blue-500/10 text-blue-700 border border-blue-200'
												: 'text-gray-700 hover:bg-gray-100/50 hover:border-gray-200'
										}
                    border border-transparent
                    clickable
                  `}
								>
									{item.icon}
									<span className='text-sm'>{item.label}</span>
								</button>
							))}
						</div>
					</div>

					{/* Boards Section */}
					<div className='mb-6'>
						<div className='flex items-center justify-between mb-3'>
							<h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
								My Boards ({boards.length})
							</h3>
							<button
								onClick={loadBoards}
								disabled={loading}
								className='p-1 rounded-lg hover:bg-gray-200/50 transition-colors duration-200 clickable force-clickable'
								title='Refresh boards'
							>
								<RefreshIcon loading={loading} />
							</button>
						</div>

						<div className='space-y-1'>
							{loading ? (
								<div className='text-center py-2'>
									<div className='text-gray-500 text-sm'>Loading boards...</div>
								</div>
							) : displayedBoards.length === 0 ? (
								<div className='text-center py-2'>
									<div className='text-gray-500 text-sm'>No boards yet</div>
									<button
										onClick={handleCreateOne}
										className='text-blue-500 text-xs hover:underline mt-1 clickable force-clickable'
									>
										Create one
									</button>
								</div>
							) : (
								<>
									{displayedBoards.map((board, idx) => {
										const colorClass = BOARD_COLORS[idx % BOARD_COLORS.length]

										return (
											<button
												key={board.id}
												onClick={() => {
													navigate(`/boards/${board.id}`)
													onClose()
												}}
												className={`w-full text-left p-2 rounded-lg text-sm transition-all duration-200 force-clickable clickable ${
													location.pathname === `/boards/${board.id}`
														? 'bg-blue-500/10 text-blue-700 border border-blue-200'
														: 'text-gray-700 hover:bg-gray-100/50 border border-transparent'
												}`}
											>
												<div className='flex items-center gap-3'>
													<div
														className={`${colorClass} w-2 h-2 rounded-full`}
													></div>
													<span className='truncate flex-1 ml-1'>
														{board.name}
													</span>
												</div>
											</button>
										)
									})}

									{/* Show More/Less */}
									{hasMoreBoards && (
										<button
											onClick={() => setShowAllBoards(!showAllBoards)}
											className='w-full text-center p-2 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 clickable force-clickable'
										>
											{showAllBoards
												? 'Show Less'
												: `Show More (${
														boards.length - MAX_BOARDS_DISPLAY
												  } more)`}
										</button>
									)}
								</>
							)}
						</div>
					</div>
				</nav>

				<div className='p-4 border-t border-gray-200/50 flex-shrink-0 relative'>
					{!token ? (
						<div className='space-y-2'>
							<button
								onClick={handleLogin}
								className='w-full p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 clickable force-clickable text-sm'
							>
								Login
							</button>
							<button
								onClick={handleSignup}
								className='w-full p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all duration-200 clickable force-clickable text-sm'
							>
								Sign Up
							</button>
						</div>
					) : (
						<div className='relative'>
							{/* Avatar Button */}
							<button
								onClick={() => setProfileOpen(!profileOpen)}
								className='w-full flex items-center gap-2 p-2 rounded-lg bg-white/60 backdrop-blur-md hover:bg-white/80 border border-gray-200 transition-all duration-200 clickable force-clickable shadow-sm'
							>
								<img
									src={getUserAvatarUrl()}
									alt='Avatar'
									className='w-8 h-8 rounded-lg object-cover'
								/>
								<div className='flex-1 min-w-0 text-left'>
									<p className='text-sm font-medium text-gray-800 truncate'>
										{userEmail || 'User'}
									</p>
								</div>
								<svg
									className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
										profileOpen ? 'rotate-180' : ''
									}`}
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 9l-7 7-7-7'
									/>
								</svg>
							</button>

							{/* Dropdown Menu */}
							{profileOpen && (
								<div className='absolute bottom-full left-0 right-0 mb-2 p-2 rounded-2xl bg-white/70 backdrop-blur-lg border border-gray-200 shadow-lg z-50 animate-fade-in-up'>
									<a
										href='https://t.me/jjkxxd'
										target='_blank'
										rel='noopener noreferrer'
										className='flex items-center gap-2 w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100/60 transition-all duration-200 text-sm'
										onClick={() => setProfileOpen(false)}
									>
										<span>💬</span>
										<span>Contact Us</span>
									</a>
									<button
										onClick={() => {
											navigate('/settings')
											setProfileOpen(false)
											onClose()
										}}
										className='flex items-center gap-2 w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100/60 transition-all duration-200 text-sm'
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
												d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
											/>
										</svg>
										<span>Settings</span>
									</button>
									<button
										onClick={handleLogout}
										className='flex items-center gap-2 w-full p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 text-sm'
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
												d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
											/>
										</svg>
										<span>Logout</span>
									</button>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	)
}
