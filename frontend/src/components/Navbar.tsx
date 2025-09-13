import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import LoginModal from './LoginModal'
import SignupModal from './SignupModal'

export default function Navbar() {
	const token = useAuthStore(s => s.accessToken)
	const clear = useAuthStore(s => s.clear)
	const [loginOpen, setLoginOpen] = useState(false)
	const [signupOpen, setSignupOpen] = useState(false)

	return (
		<>
			<header className='flex items-center justify-between p-4 bg-white/30 backdrop-blur-md rounded-b-2xl shadow-sm'>
				<div className='flex items-center gap-3'>
					<div className='w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold'>
						TT
					</div>
					<span className='text-lg font-semibold'>Task Tracker</span>
				</div>

				<div>
					{!token ? (
						<button
							onClick={() => setLoginOpen(true)}
							className='px-4 py-2 rounded-full border bg-white/80'
						>
							Login
						</button>
					) : (
						<button
							onClick={() => {
								clear()
							}}
							className='px-4 py-2 rounded-full border bg-white/80'
						>
							Logout
						</button>
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
