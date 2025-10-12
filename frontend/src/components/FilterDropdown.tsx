import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

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
	const [coords, setCoords] = useState<{
		top: number
		left: number
		width: number
	} | null>(null)
	const btnRef = useRef<HTMLButtonElement | null>(null)

	useEffect(() => {
		if (!isOpen) return

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsOpen(false)
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [isOpen])

	const openDropdown = () => {
		const btn = btnRef.current
		if (!btn) {
			setIsOpen(true)
			return
		}
		const rect = btn.getBoundingClientRect()
		setCoords({
			top: rect.bottom + 8,
			left: rect.left,
			width: Math.min(480, rect.width || 320),
		})
		setIsOpen(true)
	}

	const close = () => setIsOpen(false)

	const updateFilter = (key: keyof Filters, value: string) => {
		onFiltersChange({ ...filters, [key]: value as unknown })
	}

	const dropdownNode = isOpen ? (
		<>
			{/* backdrop */}
			<div className='fixed inset-0 z-40' onClick={close} aria-hidden />
			<div
				role='dialog'
				aria-modal='true'
				style={{
					position: 'fixed',
					top: coords?.top ?? 0,
					left: coords?.left ?? 0,
					width: coords?.width ?? 400,
				}}
				className='z-[1200] p-6 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl min-w-[280px]'
			>
				<div className='space-y-6'>
					<div>
						<label className='block text-base font-medium text-gray-700 mb-3'>
							Status
						</label>
						<select
							value={filters.status}
							onChange={e => updateFilter('status', e.target.value)}
							className='w-full p-3 text-base rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							onKeyDown={e => {
								if (e.key === 'Enter') e.currentTarget.blur()
							}}
						>
							<option value=''>All Statuses</option>
							<option value='todo'>To Do</option>
							<option value='in_progress'>In Progress</option>
							<option value='need_review'>Need Review</option>
							<option value='done'>Done</option>
						</select>
					</div>

					<div>
						<label className='block text-base font-medium text-gray-700 mb-3'>
							Priority
						</label>
						<select
							value={filters.priority}
							onChange={e => updateFilter('priority', e.target.value)}
							className='w-full p-3 text-base rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							onKeyDown={e => {
								if (e.key === 'Enter') e.currentTarget.blur()
							}}
						>
							<option value=''>All Priorities</option>
							<option value='low'>Low</option>
							<option value='medium'>Medium</option>
							<option value='high'>High</option>
						</select>
					</div>

					<div>
						<label className='block text-base font-medium text-gray-700 mb-3'>
							Deadline
						</label>
						<select
							value={filters.deadline}
							onChange={e => updateFilter('deadline', e.target.value)}
							className='w-full p-3 text-base rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							onKeyDown={e => {
								if (e.key === 'Enter') e.currentTarget.blur()
							}}
						>
							<option value=''>All Tasks</option>
							<option value='with'>With Deadline</option>
							<option value='without'>Without Deadline</option>
						</select>
					</div>
				</div>
			</div>
		</>
	) : null

	return (
		<div className='relative'>
			<button
				ref={btnRef}
				onClick={() => (isOpen ? close() : openDropdown())}
				className='px-4 py-2 rounded-xl border border-gray-300 bg-white/80 hover:bg-white transition-all duration-200 flex items-center gap-2 clickable'
				onKeyDown={e => {
					if (e.key === 'Enter') {
						e.preventDefault()
						openDropdown()
					}
				}}
				aria-haspopup='dialog'
				aria-expanded={isOpen}
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

			{dropdownNode && createPortal(dropdownNode, document.body)}
		</div>
	)
}
