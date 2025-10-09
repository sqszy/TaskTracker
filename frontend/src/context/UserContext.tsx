import { useState, useEffect, type ReactNode } from 'react'
import { useAuthStore } from '../store/auth'
import { UserContext } from './UserContext/context'

export function UserProvider({ children }: { children: ReactNode }) {
	const token = useAuthStore((s: { accessToken: unknown }) => s.accessToken)
	const [userEmail, setUserEmail] = useState('')
	const [avatarUrl, setAvatarUrl] = useState('')

	// Генерируем случайную аватарку
	const generateAvatar = (seed: string) => {
		return `https://api.dicebear.com/7.x/avatars/svg?seed=${seed}&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`
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
