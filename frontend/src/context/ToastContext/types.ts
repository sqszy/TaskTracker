export interface Toast {
	id: string
	message: string
	type: 'error' | 'success' | 'info'
	duration?: number
}

export interface ToastContextType {
	toasts: Toast[]
	addToast: (
		message: string,
		type?: 'error' | 'success' | 'info',
		duration?: number
	) => void
	removeToast: (id: string) => void
}
