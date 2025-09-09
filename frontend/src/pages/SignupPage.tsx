import { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function SignupPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const navigate = useNavigate()

	const handleSignup = async () => {
		try {
			await api.post('/signup', { email, password })
			alert('Account created, please login')
			navigate('/login')
		} catch {
			alert('Signup failed')
		}
	}

	return (
		<div className='flex h-screen items-center justify-center'>
			<div className='bg-white/70 backdrop-blur-md p-6 rounded-xl shadow w-80'>
				<h1 className='text-xl font-semibold mb-4'>Sign Up</h1>
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
					onClick={handleSignup}
					className='w-full bg-green-500 text-white py-2 rounded hover:bg-green-600'
				>
					Sign Up
				</button>
			</div>
		</div>
	)
}
