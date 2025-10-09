import {
	createContext,
	useContext,
	useState,
	type ReactNode,
	useEffect,
} from 'react'
import { useAuthStore } from '../store/auth'

interface UserContextType {
	userEmail: string
	avatarUrl: string
	setUserEmail: (email: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
	const token = useAuthStore(s => s.accessToken)
	const [userEmail, setUserEmail] = useState('')
	const [avatarUrl, setAvatarUrl] = useState('')

	// Генерируем случайную аватарку с животными
	const generateAvatar = (seed: string) => {
		const animals = [
			'bear',
			'bird',
			'cat',
			'dog',
			'fox',
			'koala',
			'lion',
			'panda',
			'pig',
			'rabbit',
		]
		const randomAnimal = animals[Math.floor(Math.random() * animals.length)]
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

export function useUser() {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider')
	}
	return context
}
