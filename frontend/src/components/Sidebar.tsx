import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { getBoards } from '../api/board'
import type { Board } from '../types/board'
import { useModal } from '../hooks/useModal'
import { useUser } from '../hooks/useUser'

interface SidebarProps {
	isOpen: boolean
	onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const token = useAuthStore(s => s.accessToken)
	const clearTokens = useAuthStore(s => s.clear)
	const { openLogin, openSignup } = useModal()
	const { userEmail } = useUser()
	const [boards, setBoards] = useState<Board[]>([])
	const [loading, setLoading] = useState(false)
	const [profileOpen, setProfileOpen] = useState(false)

	useEffect(() => {
		if (token && isOpen) {
			loadBoards()
		}
	}, [token, isOpen])

	const loadBoards = async () => {
		setLoading(true)
		try {
			const data = await getBoards()
			setBoards(data)
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
		localStorage.removeItem('userEmail')
		navigate('/dashboard')
		onClose()
		setProfileOpen(false)
	}

	const isActive = (path: string) => {
		return location.pathname === path
	}

	const menuItems = [
		{ path: '/dashboard', icon: '📊', label: 'Dashboard' },
		{ path: '/calendar', icon: '📅', label: 'Calendar' },
		{ path: '/notifications', icon: '🔔', label: 'Notifications' },
	]

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
					fixed lg:static inset-y-0 left-0 z-40
					w-64 bg-white/10 backdrop-blur-lg border-r border-white/20
					transform transition-transform duration-300 ease-in-out
					flex flex-col
					${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
					lg:min-h-screen
				`}
			>
				{/* Header */}
				<div className='p-6 border-b border-white/20'>
					<div
						className='flex items-center gap-3 cursor-pointer group clickable'
						onClick={() => {
							navigate('/dashboard')
							onClose()
						}}
					>
						<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold'>
							TT
						</div>
						<div>
							<h1 className='text-lg font-bold text-gray-800'>TaskTracker</h1>
							<p className='text-xs text-gray-600'>Project Management</p>
						</div>
					</div>
				</div>

				{/* Main Navigation - интегрированное в фон */}
				<nav className='flex-1 p-4'>
					<div className='mb-6'>
						<h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
							Navigation
						</h3>
						<div className='space-y-1'>
							{menuItems.map(item => (
								<button
									key={item.path}
									onClick={() => {
										navigate(item.path)
										onClose()
									}}
									className={`
										w-full flex items-center gap-3 p-3 rounded-lg text-left
										transition-all duration-200 font-medium
										${
											isActive(item.path)
												? 'bg-white/20 text-blue-700'
												: 'text-gray-700 hover:bg-white/10'
										}
										clickable
									`}
								>
									<span className='text-lg'>{item.icon}</span>
									<span className='text-sm'>{item.label}</span>
								</button>
							))}
						</div>
					</div>

					{/* Boards Section */}
					<div className='mb-6'>
						<div className='flex items-center justify-between mb-3'>
							<h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
								My Boards
							</h3>
							<button
								onClick={loadBoards}
								className='p-1 rounded-lg hover:bg-white/20 transition-colors duration-200 clickable'
								title='Refresh boards'
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
							</button>
						</div>

						<div className='space-y-2 max-h-64 overflow-y-auto'>
							{loading ? (
								<div className='text-center py-2'>
									<div className='text-gray-500 text-sm'>Loading boards...</div>
								</div>
							) : boards.length === 0 ? (
								<div className='text-center py-2'>
									<div className='text-gray-500 text-sm'>No boards yet</div>
									<button
										onClick={() => navigate('/dashboard')}
										className='text-blue-500 text-xs hover:underline mt-1 clickable'
									>
										Create one
									</button>
								</div>
							) : (
								boards.map(board => (
									<button
										key={board.id}
										onClick={() => {
											navigate(`/boards/${board.id}`)
											onClose()
										}}
										className={`
											w-full text-left p-2 rounded-lg text-sm
											transition-all duration-200
											${
												location.pathname === `/boards/${board.id}`
													? 'bg-white/20 text-blue-700'
													: 'text-gray-700 hover:bg-white/10'
											}
											clickable
										`}
									>
										<div className='flex items-center gap-2'>
											<div className='w-2 h-2 rounded-full bg-blue-500'></div>
											<span className='truncate flex-1'>{board.name}</span>
										</div>
									</button>
								))
							)}
						</div>
					</div>
				</nav>

				{/* User Section */}
				<div className='p-4 border-t border-white/20'>
					{!token ? (
						<div className='space-y-2'>
							<button
								onClick={handleLogin}
								className='w-full p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 clickable text-sm'
							>
								Login
							</button>
							<button
								onClick={handleSignup}
								className='w-full p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all duration-200 clickable text-sm'
							>
								Sign Up
							</button>
						</div>
					) : (
						<div className='relative'>
							<button
								onClick={() => setProfileOpen(!profileOpen)}
								className='w-full flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 clickable'
							>
								<div className='w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold'>
									{userEmail?.charAt(0).toUpperCase() || 'U'}
								</div>
								<div className='flex-1 min-w-0 text-left'>
									<p className='text-sm font-medium text-gray-800 truncate'>
										{userEmail || 'User'}
									</p>
								</div>
							</button>

							{/* Dropdown Menu */}
							{profileOpen && (
								<div className='absolute bottom-full left-0 right-0 mb-2 p-2 rounded-lg bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg z-50'>
									<a
										href='https://t.me/jjkxxd'
										target='_blank'
										rel='noopener noreferrer'
										className='flex items-center gap-2 w-full p-2 rounded text-gray-700 hover:bg-white/20 transition-all duration-200 clickable text-sm'
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
										className='flex items-center gap-2 w-full p-2 rounded text-gray-700 hover:bg-white/20 transition-all duration-200 clickable text-sm'
									>
										<span>⚙️</span>
										<span>Settings</span>
									</button>
									<button
										onClick={handleLogout}
										className='flex items-center gap-2 w-full p-2 rounded text-red-600 hover:bg-red-500/20 transition-all duration-200 clickable text-sm'
									>
										<span>🚪</span>
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
