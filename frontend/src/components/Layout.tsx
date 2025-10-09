import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 flex flex-col'>
			{/* Navbar */}
			<Navbar onMenuClick={() => setSidebarOpen(true)} />

			{/* Main content with sidebar */}
			<div className='flex flex-1 relative'>
				{/* Sidebar */}
				<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

				{/* Main content area */}
				<main className='flex-1 lg:ml-0 min-h-[calc(100vh-64px)] overflow-auto'>
					<div className='p-4 lg:p-6'>
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	)
}
