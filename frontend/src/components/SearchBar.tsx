import { useEffect, useRef, useState } from 'react'
import { useToast } from '../hooks/useToast'

interface SearchBarProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	onSearchError?: (error: string) => void
	debounceMs: number
}

export default function SearchBar({
	value,
	onChange,
	placeholder = 'Search...',
	onSearchError,
	debounceMs = 400,
}: SearchBarProps) {
	const [input, setInput] = useState(value)
	const [isSearching, setIsSearching] = useState(false)
	const { addToast } = useToast()
	const timerRef = useRef<number | null>(null)

	useEffect(() => {
		setInput(value)
	}, [value])

	useEffect(() => {
		if (timerRef.current) {
			window.clearTimeout(timerRef.current)
			timerRef.current = null
		}

		if (input === '') {
			setIsSearching(false)
			onChange('')
			return
		}

		if (input.length > 50) {
			const errorMsg = 'Search query too long'
			addToast(errorMsg, 'info')
			onSearchError?.(errorMsg)
		}

		setIsSearching(true)
		timerRef.current = window.setTimeout(() => {
			onChange(input)
			setIsSearching(false)
			timerRef.current = null
		}, debounceMs)

		return () => {
			if (timerRef.current) {
				window.clearTimeout(timerRef.current)
				timerRef.current = null
			}
		}
	}, [input, debounceMs, addToast, onChange, onSearchError])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setInput(newValue)

		if (newValue.length > 100) {
			const errorMsg = 'Search query too long'
			addToast(errorMsg, 'info')
			onSearchError?.(errorMsg)
		}
	}

	const handleClear = () => {
		if (timerRef.current) {
			window.clearTimeout(timerRef.current)
			timerRef.current = null
		}
		setInput('')
		setIsSearching(false)
		onChange('')
	}

	return (
		<div className='relative flex-1 max-w-md'>
			<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
				<span className='text-gray-400'>{isSearching ? '⏳' : '🔍'}</span>
			</div>
			<input
				type='text'
				value={input}
				onChange={handleChange}
				className='w-full pl-10 pr-4 py-2 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
				placeholder={placeholder}
				maxLength={100}
			/>
			{/* Индикатор очистки */}
			{value && (
				<button
					onClick={handleClear}
					className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
					title='Clear'
				>
					✕
				</button>
			)}
		</div>
	)
}
