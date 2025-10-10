import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import LoginModal from './LoginModal'
import SignupModal from './SignupModal'
import { useModal } from '../hooks/useModal'
import { useToast } from '../hooks/useToast'

interface NavbarProps {
	onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
	const navigate = useNavigate()
	const token = useAuthStore(s => s.accessToken)
	const clear = useAuthStore(s => s.clear)
	const {
		isLoginOpen,
		isSignupOpen,
		openLogin,
		openSignup,
		closeLogin,
		closeSignup,
	} = useModal()
	const { addToast } = useToast()
	const [profileOpen, setProfileOpen] = useState(false)

	const getUserEmail = () => {
		if (!token) return ''
		return localStorage.getItem('userEmail') || 'user@example.com'
	}

	const userEmail = getUserEmail()

	const handleLogout = () => {
		clear()
		localStorage.removeItem('userEmail')
		setProfileOpen(false)
		addToast('Successfully logged out', 'success')
		navigate('/dashboard')
	}

	const handleLoginClick = () => {
		openLogin()
	}

	const handleSignupClick = () => {
		openSignup()
	}

	return (
		<>
			{/* Navbar with Liquid Glass */}
			<header className='flex items-center justify-between p-4 navbar-glass sticky top-0 z-30'>
				{/* Left section: menu and logo */}
				<div className='flex items-center gap-3'>
					<button
						onClick={onMenuClick}
						className='p-2 rounded-xl hover:bg-white/20 transition-all duration-300 lg:hidden z-10 clickable'
					>
						<span className='text-xl'>☰</span>
					</button>

					{/* Logo and Dashboard */}
					<div className='flex items-center gap-3'>
						<div
							className='w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg clickable'
							onClick={() => navigate('/dashboard')}
						>
							TT
						</div>
						<span
							className='text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-300 hidden sm:block clickable'
							onClick={() => navigate('/dashboard')}
						>
							Dashboard
						</span>
					</div>
				</div>

				{/* Right section: auth buttons or profile */}
				<div className='flex items-center gap-2'>
					{!token ? (
						<div className='flex items-center gap-2'>
							<button
								onClick={handleLoginClick}
								className='px-4 py-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 transition-all duration-300 text-sm font-medium z-10 clickable liquid-glass-light'
							>
								Login
							</button>
							<button
								onClick={handleSignupClick}
								className='px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-300 text-sm font-medium z-10 clickable hover-lift'
							>
								Sign Up
							</button>
						</div>
					) : (
						<div className='relative z-20'>
							<button
								onClick={() => setProfileOpen(!profileOpen)}
								className='flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/30 clickable liquid-glass-light'
							>
								<div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-lg'>
									{userEmail.charAt(0).toUpperCase()}
								</div>
								<span className='text-sm font-medium text-gray-700 hidden md:block'>
									{userEmail.split('@')[0]}
								</span>
							</button>

							{/* Profile dropdown with Liquid Glass */}
							{profileOpen && (
								<>
									{/* Backdrop */}
									<div
										className='fixed inset-0 z-40 backdrop-glass'
										onClick={() => setProfileOpen(false)}
									/>
									{/* Dropdown menu */}
									<div className='absolute top-full right-0 mt-2 w-48 py-2 rounded-xl liquid-glass border border-white/30 shadow-xl z-50'>
										<div className='px-4 py-2 border-b border-white/20'>
											<p className='text-sm font-medium text-gray-800'>
												Signed in as
											</p>
											<p className='text-sm text-gray-600 truncate'>
												{userEmail}
											</p>
										</div>
										{/* Settings в выпадающем меню */}
										<button
											onClick={() => {
												navigate('/settings')
												setProfileOpen(false)
											}}
											className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/20 transition-colors duration-300 flex items-center gap-2'
										>
											<span>⚙️</span>
											<span>Settings</span>
										</button>
										<button
											onClick={handleLogout}
											className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/20 transition-colors duration-300 flex items-center gap-2'
										>
											<span>🚪</span>
											<span>Logout</span>
										</button>
									</div>
								</>
							)}
						</div>
					)}
				</div>
			</header>

			{/* Modals */}
			<LoginModal
				open={isLoginOpen}
				onClose={closeLogin}
				openSignup={openSignup}
			/>
			<SignupModal
				open={isSignupOpen}
				onClose={closeSignup}
				openLogin={openLogin}
			/>
		</>
	)
}
