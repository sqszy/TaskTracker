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

	// Получаем email пользователя
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
			{/* Компактный Navbar */}
			<header className='flex items-center justify-between p-3 bg-white/50 backdrop-blur-md border-b border-gray-200/50'>
				{/* Левый блок: меню и лого */}
				<div className='flex items-center gap-3'>
					<button
						onClick={onMenuClick}
						className='p-2 rounded-xl hover:bg-white/50 transition-all duration-200 lg:hidden'
					>
						<span className='text-xl'>☰</span>
					</button>

					{/* Аватарка TT и Dashboard */}
					<div className='flex items-center gap-3'>
						<div
							className='w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform duration-200'
							onClick={() => navigate('/dashboard')}
						>
							TT
						</div>
						<span
							className='text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200 hidden sm:block'
							onClick={() => navigate('/dashboard')}
						>
							Dashboard
						</span>
					</div>
				</div>

				{/* Правый блок: кнопки логина/регистрации или профиль */}
				<div className='flex items-center gap-2'>
					{!token ? (
						<div className='flex items-center gap-2'>
							<button
								onClick={handleLoginClick}
								className='px-4 py-2 rounded-xl border border-gray-200 bg-white/70 hover:bg-white/90 transition-all duration-200 text-sm font-medium'
							>
								Login
							</button>
							<button
								onClick={handleSignupClick}
								className='px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200 text-sm font-medium'
							>
								Sign Up
							</button>
						</div>
					) : (
						<div className='relative'>
							<button
								onClick={() => setProfileOpen(!profileOpen)}
								className='flex items-center gap-2 p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-200'
							>
								<div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold'>
									{userEmail.charAt(0).toUpperCase()}
								</div>
								<span className='text-sm font-medium text-gray-700 hidden md:block'>
									{userEmail.split('@')[0]}
								</span>
							</button>

							{profileOpen && (
								<>
									<div
										className='fixed inset-0 z-40'
										onClick={() => setProfileOpen(false)}
									/>
									<div className='absolute top-full right-0 mt-2 w-48 py-2 rounded-xl bg-white/90 backdrop-blur-md shadow-xl border border-gray-200/50 z-50'>
										<div className='px-4 py-2 border-b border-gray-200/50'>
											<p className='text-sm font-medium'>Signed in as</p>
											<p className='text-sm text-gray-600 truncate'>
												{userEmail}
											</p>
										</div>
										<button
											onClick={handleLogout}
											className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2'
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

			{/* Модалки */}
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
