import { useState } from 'react'
import api from '../api/axios'
import { useAuthStore } from '../store/auth'
import Modal from './Modal'

export default function LoginModal({
	open,
	onClose,
	openSignup,
}: {
	open: boolean
	onClose: () => void
	openSignup: () => void
}) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const setTokens = useAuthStore(s => s.setTokens)

	const submit = async () => {
		try {
			const res = await api.post('/login', { email, password })
			setTokens(res.data.access_token, res.data.refresh_token)
			onClose()
		} catch (e) {
			console.error(e)
			alert('Login failed')
		}
	}

	return (
		<Modal open={open} onClose={onClose} title='Login' width='max-w-sm'>
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
					placeholder='Password'
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>
				<div className='flex gap-2'>
					<button
						onClick={submit}
						className='flex-1 py-2 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow'
					>
						Login
					</button>
					<button
						onClick={openSignup}
						className='px-4 py-2 rounded-full border bg-white/80'
					>
						Sign up
					</button>
				</div>
			</div>
		</Modal>
	)
}
