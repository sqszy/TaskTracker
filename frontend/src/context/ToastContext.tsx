import { useState, type ReactNode } from 'react'
import { ToastContext } from './ToastContext/context'
import type { Toast } from './ToastContext/types'

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([])

	const addToast = (
		message: string,
		type: 'error' | 'success' | 'info' = 'error',
		duration = 5000
	) => {
		const id = Math.random().toString(36).substring(2, 9)
		const toast: Toast = { id, message, type, duration }

		setToasts(prev => [...prev, toast])

		setTimeout(() => {
			removeToast(id)
		}, duration)
	}

	const removeToast = (id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id))
	}

	return (
		<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
			{children}
		</ToastContext.Provider>
	)
}
