import { useState, type ReactNode } from 'react'
import { ModalContext } from './ModalContext/context'

export function ModalProvider({ children }: { children: ReactNode }) {
	const [isLoginOpen, setIsLoginOpen] = useState(false)
	const [isSignupOpen, setIsSignupOpen] = useState(false)

	const openLogin = () => {
		setIsLoginOpen(true)
		setIsSignupOpen(false)
	}

	const openSignup = () => {
		setIsSignupOpen(true)
		setIsLoginOpen(false)
	}

	const closeLogin = () => setIsLoginOpen(false)
	const closeSignup = () => setIsSignupOpen(false)

	return (
		<ModalContext.Provider
			value={{
				isLoginOpen,
				isSignupOpen,
				openLogin,
				openSignup,
				closeLogin,
				closeSignup,
			}}
		>
			{children}
		</ModalContext.Provider>
	)
}
