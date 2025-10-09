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

	useEffect(() => {
		const handleOpenLogin = () => {
			openLogin()
			onClose()
		}

		document.addEventListener('openLoginModal', handleOpenLogin)

		return () => {
			document.removeEventListener('openLoginModal', handleOpenLogin)
		}
	}, [openLogin, onClose])

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
					className='fixed inset-0 bg-black/50 z-40 lg:hidden'
					onClick={onClose}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`
					fixed lg:static inset-y-0 left-0 z-40
					w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50
					transform transition-transform duration-300 ease-in-out
					flex flex-col
					${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
					lg:min-h-screen 
				`}
			>
				{/* Header */}
				<div className='p-6 border-b border-gray-200/50'>
					<div
						className='flex items-center gap-3 cursor-pointer group'
						onClick={() => {
							navigate('/dashboard')
							onClose()
						}}
					>
						<div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg'>
							TT
						</div>
						<div>
							<h1 className='text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200'>
								TaskTracker
							</h1>
							<p className='text-sm text-gray-600'>Project Management</p>
						</div>
					</div>
				</div>

				{/* Main Navigation */}
				<nav className='flex-1 p-4 space-y-2'>
					<div className='mb-4'>
						<h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2'>
							Dashboard
						</h3>
						{menuItems.map(item => (
							<button
								key={item.path}
								onClick={() => {
									navigate(item.path)
									onClose()
								}}
								className={`
									w-full flex items-center gap-3 p-3 rounded-xl text-left
									transition-all duration-200 font-medium
									${
										isActive(item.path)
											? 'bg-blue-500/10 text-blue-700 border border-blue-200'
											: 'text-gray-700 hover:bg-gray-100/50 hover:border-gray-200'
									}
									border border-transparent
								`}
							>
								<span className='text-lg'>{item.icon}</span>
								<span>{item.label}</span>
							</button>
						))}
					</div>

					{/* Boards Section */}
					<div className='mb-4'>
						<div className='flex items-center justify-between mb-2'>
							<h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
								My Boards
							</h3>
							<button
								onClick={loadBoards}
								className='p-1 rounded-lg hover:bg-gray-200/50 transition-colors duration-200'
								title='Refresh boards'
								disabled={loading}
							>
								{loading ? '⏳' : '🔄'}
							</button>
						</div>

						<div className='space-y-1 max-h-48 overflow-y-auto'>
							{loading ? (
								<div className='text-center py-2'>
									<div className='text-gray-500 text-sm'>Loading boards...</div>
								</div>
							) : boards.length === 0 ? (
								<div className='text-center py-2'>
									<div className='text-gray-500 text-sm'>No boards yet</div>
									<button
										onClick={() => navigate('/dashboard')}
										className='text-blue-500 text-sm hover:underline mt-1'
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
													? 'bg-blue-500/10 text-blue-700 border border-blue-200'
													: 'text-gray-700 hover:bg-gray-100/50 border border-transparent'
											}
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
				<div className='p-4 border-t border-gray-200/50'>
					{!token ? (
						<div className='space-y-2'>
							<button
								onClick={handleLogin}
								className='w-full p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'
							>
								Login
							</button>
							<button
								onClick={handleSignup}
								className='w-full p-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200'
							>
								Sign Up
							</button>
						</div>
					) : (
						<div className='relative'>
							<button
								onClick={() => setProfileOpen(!profileOpen)}
								className='w-full flex items-center gap-3 p-3 rounded-xl bg-gray-100/50 hover:bg-gray-200/50 transition-all duration-200 border border-gray-200'
							>
								<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold'>
									{userEmail?.charAt(0).toUpperCase() || 'U'}
								</div>
								<div className='flex-1 min-w-0 text-left'>
									<p className='text-sm font-medium text-gray-800 truncate'>
										{userEmail || 'User'}
									</p>
									<p className='text-xs text-gray-600'>View profile</p>
								</div>
								<span
									className={`transform transition-transform ${
										profileOpen ? 'rotate-180' : ''
									}`}
								>
									▼
								</span>
							</button>

							{/* Dropdown Menu */}
							{profileOpen && (
								<div className='absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-white border border-gray-200 shadow-lg z-50'>
									<a
										href='https://t.me/jjk'
										target='_blank'
										rel='noopener noreferrer'
										className='flex items-center gap-3 w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200'
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
										className='flex items-center gap-3 w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200'
									>
										<span>⚙️</span>
										<span>Settings</span>
									</button>
									<button
										onClick={handleLogout}
										className='flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200'
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
