import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout() {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30'>
			<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

			<div className='lg:ml-80'>
				<Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
				<main className='p-6'>
					<Outlet />
				</main>
			</div>
		</div>
	)
}
