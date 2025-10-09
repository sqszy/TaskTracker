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
		<div className='relative'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='px-4 py-2 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md hover:bg-white/90 transition-all duration-200 flex items-center gap-2'
			>
				<span>Filter</span>
				<span
					className={`transform transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
				>
					▼
				</span>
			</button>

			{isOpen && (
				<>
					{/* Backdrop with higher z-index */}
					<div
						className='fixed inset-0 z-40'
						onClick={() => setIsOpen(false)}
					/>
					{/* Dropdown with higher z-index */}
					<div className='absolute top-full right-0 mt-2 w-64 p-4 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-gray-200/50 z-50'>
						<div className='space-y-4'>
							{/* Status Filter */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Status
								</label>
								<select
									value={filters.status}
									onChange={e => updateFilter('status', e.target.value)}
									className='w-full p-2 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
									className='w-full p-2 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
									className='w-full p-2 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
