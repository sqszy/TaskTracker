import { useState } from 'react'
import { useToast } from '../hooks/useToast'

interface SearchBarProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	onSearchError?: (error: string) => void
}

export default function SearchBar({
	value,
	onChange,
	placeholder = 'Search...',
	onSearchError,
}: SearchBarProps) {
	const [isSearching] = useState(false)
	const { addToast } = useToast()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		onChange(newValue)

		// Можно добавить дебаунс здесь если нужно
		if (newValue.length > 50) {
			const errorMsg = 'Search query too long'
			addToast(errorMsg, 'info')
			onSearchError?.(errorMsg)
		}
	}

	return (
		<div className='relative flex-1 max-w-md'>
			<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
				<span className='text-gray-400'>{isSearching ? '⏳' : '🔍'}</span>
			</div>
			<input
				type='text'
				value={value}
				onChange={handleChange}
				className='w-full pl-10 pr-4 py-2 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
				placeholder={placeholder}
				maxLength={100} // Ограничение длины для предотвращения ошибок
			/>
			{/* Индикатор очистки */}
			{value && (
				<button
					onClick={() => onChange('')}
					className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
				>
					✕
				</button>
			)}
		</div>
	)
}
