export type ViewMode = 'board' | 'list'

interface ViewSwitchProps {
	mode: ViewMode
	onChange: (mode: ViewMode) => void
}

export default function ViewSwitch({ mode, onChange }: ViewSwitchProps) {
	const views = [
		{ value: 'board' as ViewMode, label: 'Board', icon: '📋' },
		{ value: 'list' as ViewMode, label: 'List', icon: '📝' },
	] as const

	return (
		<div className='flex rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md p-1'>
			{views.map(view => (
				<button
					key={view.value}
					onClick={() => onChange(view.value)}
					className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
						mode === view.value
							? 'bg-white shadow-sm text-gray-900'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					<span>{view.icon}</span>
					<span className='text-sm font-medium'>{view.label}</span>
				</button>
			))}
		</div>
	)
}
