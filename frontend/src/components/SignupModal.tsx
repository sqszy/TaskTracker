import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import Modal from './Modal'
import { signup, login } from '../api/auth'
import { useToast } from '../hooks/useToast'

interface SignupModalProps {
	open: boolean
	onClose: () => void
	openLogin?: () => void
}

export default function SignupModal({
	open,
	onClose,
	openLogin,
}: SignupModalProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const setTokens = useAuthStore(s => s.setTokens)
	const { addToast } = useToast()

	const submit = async () => {
		if (!email || !password) {
			addToast('Please fill in all fields', 'error')
			return
		}

		if (password.length < 6) {
			addToast('Password must be at least 6 characters long', 'error')
			return
		}

		setLoading(true)
		try {
			await signup({ email, password })

			const loginData = await login({ email, password })
			setTokens(loginData.access_token, loginData.refresh_token)

			localStorage.setItem('userEmail', email)

			onClose()
			setEmail('')
			setPassword('')
		} catch (e: unknown) {
			console.error(e)
			addToast('Signup failed', 'error')
		} finally {
			setLoading(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') submit()
	}

	return (
		<Modal open={open} onClose={onClose} title='Sign up' width='max-w-sm'>
			<div className='space-y-4'>
				<input
					className='w-full p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
					type='email'
					placeholder='Email'
					value={email}
					onChange={e => setEmail(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={loading}
				/>
				<input
					className='w-full p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
					type='password'
					placeholder='Password (min 6)'
					value={password}
					onChange={e => setPassword(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={loading}
				/>
				<div className='flex gap-2'>
					<button
						onClick={submit}
						disabled={loading}
						className='flex-1 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50'
					>
						{loading ? 'Creating...' : 'Create account'}
					</button>
					{openLogin && (
						<button
							onClick={() => {
								onClose()
								openLogin()
							}}
							disabled={loading}
							className='px-4 py-3 rounded-xl border border-gray-200 bg-white/70 hover:bg-white/90 transition-all duration-200 disabled:opacity-50'
						>
							Login
						</button>
					)}
				</div>
			</div>
		</Modal>
	)
}
