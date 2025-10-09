import { useToast } from '../hooks/useToast'

export default function ToastContainer() {
	const { toasts, removeToast } = useToast()

	return (
		<div className='fixed bottom-4 right-4 z-50 space-y-2 max-w-sm'>
			{toasts.map(toast => (
				<div
					key={toast.id}
					className={`p-4 rounded-xl shadow-lg border backdrop-blur-md transform transition-all duration-300 ${
						toast.type === 'error'
							? 'bg-red-50/90 border-red-200 text-red-800'
							: toast.type === 'success'
							? 'bg-green-50/90 border-green-200 text-green-800'
							: 'bg-blue-50/90 border-blue-200 text-blue-800'
					}`}
				>
					<div className='flex items-start justify-between'>
						<div className='flex-1'>
							<p className='text-sm font-medium'>{toast.message}</p>
						</div>
						<button
							onClick={() => removeToast(toast.id)}
							className='ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors'
						>
							×
						</button>
					</div>
				</div>
			))}
		</div>
	)
}
