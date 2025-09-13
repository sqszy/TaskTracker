import React from 'react'

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
	if (!open) return null
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center'>
			<div className='absolute inset-0 bg-black/40' onClick={onClose} />
			<div
				className={`relative ${width} p-6 rounded-2xl bg-white/50 backdrop-blur-md shadow-2xl z-10`}
			>
				{title && <h3 className='text-lg font-semibold mb-4'>{title}</h3>}
				{children}
			</div>
		</div>
	)
}
