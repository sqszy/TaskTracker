export type SortOption = 'newest' | 'oldest' | 'deadline_asc' | 'deadline_desc'

interface SortSelectProps {
	value: SortOption
	onChange: (value: SortOption) => void
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
	const options = [
		{ value: 'newest', label: 'Newest First' },
		{ value: 'oldest', label: 'Oldest First' },
		{ value: 'deadline_asc', label: 'Deadline (Earliest)' },
		{ value: 'deadline_desc', label: 'Deadline (Latest)' },
	]

	return (
		<select
			value={value}
			onChange={e => onChange(e.target.value as SortOption)}
			className='px-4 py-2 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
		>
			{options.map(option => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	)
}
