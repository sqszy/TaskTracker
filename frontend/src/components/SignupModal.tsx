import { useState } from 'react'
import api from '../api/axios'
import { useAuthStore } from '../store/auth'
import Modal from './Modal'

export default function SignupModal({
	open,
	onClose,
}: {
	open: boolean
	onClose: () => void
}) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const setTokens = useAuthStore(s => s.setTokens)

	const submit = async () => {
		try {
			await api.post('/signup', { email, password })
			// after signup, auto-login
			const res = await api.post('/login', { email, password })
			setTokens(res.data.access_token, res.data.refresh_token)
			onClose()
		} catch (e) {
			console.error(e)
			alert('Signup failed')
		}
	}

	return (
		<Modal open={open} onClose={onClose} title='Sign up' width='max-w-sm'>
			<div className='space-y-3'>
				<input
					className='w-full p-2 rounded-md border bg-white/70'
					type='email'
					placeholder='Email'
					value={email}
					onChange={e => setEmail(e.target.value)}
				/>
				<input
					className='w-full p-2 rounded-md border bg-white/70'
					type='password'
					placeholder='Password (min 6)'
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>
				<div className='flex gap-2'>
					<button
						onClick={submit}
						className='flex-1 py-2 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow'
					>
						Create account
					</button>
				</div>
			</div>
		</Modal>
	)
}
