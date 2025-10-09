export interface ModalContextType {
	isLoginOpen: boolean
	isSignupOpen: boolean
	openLogin: () => void
	openSignup: () => void
	closeLogin: () => void
	closeSignup: () => void
}
