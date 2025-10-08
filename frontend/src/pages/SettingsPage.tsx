export default function SettingsPage() {
	return (
		<div className='max-w-6xl mx-auto'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900 mb-2'>Settings</h1>
				<p className='text-gray-600'>Customize your workspace</p>
			</div>

			<div className='bg-white/70 backdrop-blur-md rounded-2xl p-8 text-center border border-gray-200/50'>
				<div className='text-6xl mb-4'>⚙️</div>
				<h2 className='text-2xl font-bold text-gray-900 mb-4'>
					Settings Panel
				</h2>
				<p className='text-gray-600 mb-6'>
					Settings configuration coming soon...
				</p>
				<button className='px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200'>
					Configure
				</button>
			</div>
		</div>
	)
}
