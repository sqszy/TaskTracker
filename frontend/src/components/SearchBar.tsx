import React from 'react'

interface SearchBarProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
}

export default function SearchBar({
	value,
	onChange,
	placeholder = 'Search...',
}: SearchBarProps) {
	return (
		<div className='relative flex-1 max-w-md'>
			<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
				<span className='text-gray-400'>🔍</span>
			</div>
			<input
				type='text'
				value={value}
				onChange={e => onChange(e.target.value)}
				className='w-full pl-10 pr-4 py-2 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
				placeholder={placeholder}
			/>
		</div>
	)
}
