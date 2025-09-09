import { useAuthStore } from '../store/auth'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
	const clear = useAuthStore(s => s.clear)
	const navigate = useNavigate()
	const logout = () => {
		clear()
		navigate('/login')
	}

	return (
		<header className='flex items-center justify-between p-4 bg-white/30 backdrop-blur-md rounded-b-2xl shadow-sm'>
			<div className='flex items-center gap-3'>
				<div className='w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold'>
					TT
				</div>
				<span className='text-lg font-semibold'>TaskTracker</span>
			</div>

			<div>
				<button
					onClick={logout}
					className='px-3 py-1 rounded-full bg-white/80 shadow'
				>
					Logout
				</button>
			</div>
		</header>
	)
}
