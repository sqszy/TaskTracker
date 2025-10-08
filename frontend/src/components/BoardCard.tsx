import React from 'react'
import type { Board } from '../types/board'

interface BoardCardProps {
	board: Board
	onOpen: (id: number, name: string) => void
	onOpenFull: (id: number) => void
}

export default function BoardCard({
	board,
	onOpen,
	onOpenFull,
}: BoardCardProps) {
	return (
		<div className='group'>
			<div className='w-64 p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm border border-gray-200/50 cursor-pointer transform hover:scale-[1.02] hover:shadow-md transition-all duration-200'>
				<h3 className='text-lg font-semibold mb-2 text-gray-900'>
					{board.name}
				</h3>
				<p className='text-sm text-gray-600 mb-4'>
					Created {new Date(board.created_at).toLocaleDateString()}
				</p>

				<div className='flex gap-2'>
					<button
						onClick={e => {
							e.stopPropagation()
							onOpen(board.id, board.name)
						}}
						className='flex-1 py-2 px-3 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors duration-200'
					>
						Quick View
					</button>
					<button
						onClick={e => {
							e.stopPropagation()
							onOpenFull(board.id)
						}}
						className='flex-1 py-2 px-3 rounded-xl border border-gray-200 bg-white/70 text-gray-700 text-sm font-medium hover:bg-white/90 transition-colors duration-200'
					>
						Open Full
					</button>
				</div>
			</div>
		</div>
	)
}
