import { useState, type ReactNode } from 'react'
import { ModalContext } from './ModalContext/context'
import LoginModal from '../components/LoginModal'
import SignupModal from '../components/SignupModal'

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

			<LoginModal
				open={isLoginOpen}
				onClose={closeLogin}
				openSignup={() => {
					setIsLoginOpen(false)
					setIsSignupOpen(true)
				}}
			/>

			<SignupModal
				open={isSignupOpen}
				onClose={closeSignup}
				openLogin={() => {
					setIsSignupOpen(false)
					setIsLoginOpen(true)
				}}
			/>
		</ModalContext.Provider>
	)
}
