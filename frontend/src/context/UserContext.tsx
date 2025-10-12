import { useState, useEffect, type ReactNode } from 'react'
import { useAuthStore } from '../store/auth'
import { UserContext } from './UserContext/context'

export function UserProvider({ children }: { children: ReactNode }) {
	const token = useAuthStore((s: { accessToken: unknown }) => s.accessToken)
	const [userEmail, setUserEmail] = useState('')
	const [avatarUrl, setAvatarUrl] = useState('')

	const generateAvatar = (seed: string) => {
		return `https://api.multiavatar.com/${encodeURIComponent(seed)}.svg`
	}

	useEffect(() => {
		if (token) {
			const email = localStorage.getItem('userEmail') || 'user@example.com'
			setUserEmail(email)
			setAvatarUrl(generateAvatar(email))
		} else {
			setUserEmail('')
			setAvatarUrl('')
		}
	}, [token])

	return (
		<UserContext.Provider value={{ userEmail, avatarUrl, setUserEmail }}>
			{children}
		</UserContext.Provider>
	)
}
