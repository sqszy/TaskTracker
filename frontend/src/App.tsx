import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import BoardDetail from './pages/BoardDetail'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/login' element={<LoginPage />} />
				<Route path='/signup' element={<SignupPage />} />
				<Route path='/dashboard' element={<Dashboard />} />
				<Route path='/boards/:id' element={<BoardDetail />} />
				<Route path='/' element={<Navigate to='/dashboard' />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
