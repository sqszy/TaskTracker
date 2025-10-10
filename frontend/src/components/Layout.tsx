import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const location = useLocation()

	const getPageTitle = () => {
		const path = location.pathname
		if (path === '/dashboard') return 'Task Tracker/Dashboard'
		if (path.startsWith('/boards/')) {
			const boardId = path.split('/')[2]
			return `Board ${boardId}`
		}
		if (path === '/calendar') return 'Task Tracker/Calendar'
		if (path === '/notifications') return 'Task Tracker/Notifications'
		if (path === '/settings') return 'Task Tracker/Settings'
		return 'TaskTracker'
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 flex'>
			{/* Sidebar */}
			<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

			{/* Main content */}
			<div className='flex-1 flex flex-col'>
				{/* Minimal Header - только заголовок страницы */}
				<header className='p-4 border-b border-white/20'>
					<h1 className='text-xl font-semibold text-gray-800'>
						{getPageTitle()}
					</h1>
				</header>

				{/* Main content area */}
				<main className='flex-1 p-6 overflow-auto'>
					<Outlet />
				</main>
			</div>
		</div>
	)
}
