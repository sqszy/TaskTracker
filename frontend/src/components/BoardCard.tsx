import type { Board } from '../types/board'
import { useNavigate } from 'react-router-dom'

export default function BoardCard({ board }: { board: Board }) {
	const nav = useNavigate()
	return (
		<div
			onClick={() => nav(`/boards/${board.id}`)}
			className='w-64 p-6 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg cursor-pointer transform hover:scale-[1.02] transition'
		>
			<h3 className='text-lg font-semibold mb-2'>{board.name}</h3>
			<p className='text-sm text-gray-600'>ID: {board.id}</p>
		</div>
	)
}
