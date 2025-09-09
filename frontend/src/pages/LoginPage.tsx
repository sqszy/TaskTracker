import { useState } from 'react'
import api from '../api/axios'
import { useAuthStore } from '../store/auth'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const setTokens = useAuthStore(s => s.setTokens)
	const navigate = useNavigate()

	const handleLogin = async () => {
		try {
			const res = await api.post('/login', { email, password })
			setTokens(res.data.access_token, res.data.refresh_token)
			navigate('/dashboard')
		} catch {
			alert('Login failed')
		}
	}

	return (
		<div className='flex h-screen items-center justify-center'>
			<div className='bg-white/70 backdrop-blur-md p-6 rounded-xl shadow w-80'>
				<h1 className='text-xl font-semibold mb-4'>Login</h1>
				<input
					className='w-full p-2 mb-3 border rounded'
					type='email'
					placeholder='Email'
					value={email}
					onChange={e => setEmail(e.target.value)}
				/>
				<input
					className='w-full p-2 mb-3 border rounded'
					type='password'
					placeholder='Password'
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>
				<button
					onClick={handleLogin}
					className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'
				>
					Login
				</button>
			</div>
		</div>
	)
}
