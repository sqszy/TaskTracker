import { useState } from 'react'

interface Filters {
	status: string
	priority: string
	deadline: 'with' | 'without' | ''
}

interface FilterDropdownProps {
	filters: Filters
	onFiltersChange: (filters: Filters) => void
}

export default function FilterDropdown({
	filters,
	onFiltersChange,
}: FilterDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)

	const updateFilter = (key: keyof Filters, value: string) => {
		onFiltersChange({ ...filters, [key]: value as unknown })
	}

	return (
		<div className='relative z-[100]'>
			{' '}
			{/* Увеличиваем z-index */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='px-4 py-2 rounded-xl border border-gray-300 bg-white/80 hover:bg-white transition-all duration-200 flex items-center gap-2 clickable'
			>
				<svg
					className='w-4 h-4'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
					/>
				</svg>
				<span>Filter</span>
				<svg
					className={`w-4 h-4 transform transition-transform duration-200 ${
						isOpen ? 'rotate-180' : ''
					}`}
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M19 9l-7 7-7-7'
					/>
				</svg>
			</button>
			{isOpen && (
				<>
					{/* Backdrop */}
					<div
						className='fixed inset-0 z-40'
						onClick={() => setIsOpen(false)}
					/>
					{/* Dropdown */}
					<div className='absolute top-full right-0 mt-2 w-64 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl z-[1000]'>
						{' '}
						{/* Увеличиваем z-index */}
						<div className='space-y-4'>
							{/* Status Filter */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Status
								</label>
								<select
									value={filters.status}
									onChange={e => updateFilter('status', e.target.value)}
									className='w-full p-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								>
									<option value=''>All Statuses</option>
									<option value='todo'>To Do</option>
									<option value='in_progress'>In Progress</option>
									<option value='need_review'>Need Review</option>
									<option value='done'>Done</option>
								</select>
							</div>

							{/* Priority Filter */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Priority
								</label>
								<select
									value={filters.priority}
									onChange={e => updateFilter('priority', e.target.value)}
									className='w-full p-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								>
									<option value=''>All Priorities</option>
									<option value='low'>Low</option>
									<option value='medium'>Medium</option>
									<option value='high'>High</option>
								</select>
							</div>

							{/* Deadline Filter */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Deadline
								</label>
								<select
									value={filters.deadline}
									onChange={e => updateFilter('deadline', e.target.value)}
									className='w-full p-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								>
									<option value=''>All Tasks</option>
									<option value='with'>With Deadline</option>
									<option value='without'>Without Deadline</option>
								</select>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
