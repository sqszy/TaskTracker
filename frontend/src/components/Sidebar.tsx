import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { getBoards } from '../api/board'
import type { Board } from '../types/board'

interface SidebarProps {
	isOpen: boolean
	onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const token = useAuthStore(s => s.accessToken)
	const [boards, setBoards] = useState<Board[]>([])
	const [loading, setLoading] = useState(false)

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

	const isActive = (path: string) => {
		return location.pathname === path
	}

	const menuItems = [
		{ path: '/dashboard', icon: '📊', label: 'Dashboard' },
		{ path: '/calendar', icon: '📅', label: 'Calendar' },
		{ path: '/notifications', icon: '🔔', label: 'Notifications' },
		{ path: '/settings', icon: '⚙️', label: 'Settings' },
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
        fixed lg:static inset-y-0 left-0 z-50
        w-80 bg-white/90 backdrop-blur-md border-r border-gray-200/50
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
			>
				{/* Header */}
				<div className='p-6 border-b border-gray-200/50'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold'>
							TT
						</div>
						<div>
							<h1 className='text-lg font-semibold text-gray-900'>
								TaskTracker
							</h1>
							<p className='text-sm text-gray-600'>Project Management</p>
						</div>
					</div>
				</div>

				{/* Main Navigation */}
				<nav className='flex-1 p-4 space-y-2'>
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
										? 'bg-blue-500 text-white shadow-lg'
										: 'text-gray-700 hover:bg-white/70 hover:text-gray-900'
								}
              `}
						>
							<span className='text-lg'>{item.icon}</span>
							<span>{item.label}</span>
						</button>
					))}
				</nav>

				{/* Boards Section */}
				<div className='p-4 border-t border-gray-200/50'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='font-semibold text-gray-900'>My Boards</h3>
						<button
							onClick={loadBoards}
							className='p-1 rounded-lg hover:bg-white/50 transition-colors duration-200'
							title='Refresh boards'
						>
							🔄
						</button>
					</div>

					<div className='space-y-2 max-h-64 overflow-y-auto'>
						{loading ? (
							<div className='text-center py-4'>
								<div className='text-gray-500 text-sm'>Loading boards...</div>
							</div>
						) : boards.length === 0 ? (
							<div className='text-center py-4'>
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
                    w-full text-left p-3 rounded-xl text-sm
                    transition-all duration-200
                    ${
											location.pathname === `/boards/${board.id}`
												? 'bg-blue-100 text-blue-700 border border-blue-200'
												: 'text-gray-700 hover:bg-white/70 hover:text-gray-900'
										}
                  `}
								>
									<div className='flex items-center gap-2'>
										<div className='w-2 h-2 rounded-full bg-blue-500'></div>
										<span className='truncate'>{board.name}</span>
									</div>
									<div className='text-xs text-gray-500 mt-1'>
										Created {new Date(board.created_at).toLocaleDateString()}
									</div>
								</button>
							))
						)}
					</div>
				</div>

				{/* User Profile */}
				{token && (
					<div className='p-4 border-t border-gray-200/50'>
						<div className='flex items-center gap-3 p-2'>
							<div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold'>
								U
							</div>
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-medium text-gray-900 truncate'>
									user@example.com
								</p>
								<p className='text-xs text-gray-600'>Free Plan</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	)
}
