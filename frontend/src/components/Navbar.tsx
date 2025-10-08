import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import LoginModal from './LoginModal'
import SignupModal from './SignupModal'

interface NavbarProps {
	onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
	const navigate = useNavigate()
	const token = useAuthStore(s => s.accessToken)
	const clear = useAuthStore(s => s.clear)
	const [loginOpen, setLoginOpen] = useState(false)
	const [signupOpen, setSignupOpen] = useState(false)
	const [profileOpen, setProfileOpen] = useState(false)

	const userInitial = token ? 'U' : 'G'

	return (
		<>
			<header className='flex items-center justify-between p-4 bg-white/30 backdrop-blur-md border-b border-gray-200/50'>
				{/* Left: Menu Button and Logo */}
				<div className='flex items-center gap-4'>
					<button
						onClick={onMenuClick}
						className='p-2 rounded-xl hover:bg-white/50 transition-all duration-200 lg:hidden'
					>
						<span className='text-xl'>☰</span>
					</button>

					<div
						className='flex items-center gap-3 cursor-pointer group'
						onClick={() => navigate('/dashboard')}
					>
						<div className='w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold lg:hidden'>
							TT
						</div>
						<span className='text-lg font-semibold group-hover:text-blue-600 transition-colors duration-200'>
							TaskTracker
						</span>
					</div>
				</div>

				{/* User Menu */}
				<div className='relative'>
					{!token ? (
						<button
							onClick={() => setLoginOpen(true)}
							className='px-4 py-2 rounded-full border border-gray-200 bg-white/80 hover:bg-white transition-all duration-200'
						>
							Login
						</button>
					) : (
						<div className='flex items-center gap-3'>
							<button
								onClick={() => setProfileOpen(!profileOpen)}
								className='flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-200'
							>
								<div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold'>
									{userInitial}
								</div>
								<span className='text-sm font-medium hidden sm:block'>
									User
								</span>
								<span
									className={`transform transition-transform ${
										profileOpen ? 'rotate-180' : ''
									}`}
								>
									▼
								</span>
							</button>
						</div>
					)}

					{/* Profile Dropdown */}
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
										user@example.com
									</p>
								</div>
								<button
									onClick={() => {
										clear()
										setProfileOpen(false)
										navigate('/dashboard')
									}}
									className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2'
								>
									<span>🚪</span>
									<span>Logout</span>
								</button>
							</div>
						</>
					)}
				</div>
			</header>

			<LoginModal
				open={loginOpen}
				onClose={() => setLoginOpen(false)}
				openSignup={() => {
					setLoginOpen(false)
					setSignupOpen(true)
				}}
			/>
			<SignupModal open={signupOpen} onClose={() => setSignupOpen(false)} />
		</>
	)
}
