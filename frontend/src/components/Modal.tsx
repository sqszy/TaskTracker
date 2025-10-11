import React, { useEffect, useRef } from 'react'

interface ModalProps {
	open: boolean
	onClose: () => void
	children: React.ReactNode
	title?: string
	width?: string
}

export default function Modal({
	open,
	onClose,
	children,
	title,
	width = 'w-full max-w-lg',
}: ModalProps) {
	const dialogRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!open) return

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}

		document.addEventListener('keydown', onKey)
		dialogRef.current?.focus()

		return () => {
			document.removeEventListener('keydown', onKey)
		}
	}, [open, onClose])

	if (!open) return null

	return (
		<div
			className='fixed inset-0 z-[9999] flex items-center justify-center p-4'
			role='dialog'
			aria-modal='true'
		>
			<div
				className='absolute inset-0 bg-black/40 backdrop-blur-sm'
				onClick={onClose}
			/>
			<div
				ref={dialogRef}
				tabIndex={-1}
				className={`relative ${width} p-6 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl z-70 liquid-glass`}
			>
				{title && (
					<div className='flex items-center justify-between mb-4 pb-4 border-b border-white/20'>
						<h3 className='text-lg font-semibold text-gray-800'>{title}</h3>
						<button
							onClick={onClose}
							className='p-1 rounded-lg hover:bg-white/20 transition-colors duration-200'
							aria-label='Close'
						>
							×
						</button>
					</div>
				)}
				{children}
			</div>
		</div>
	)
}
