import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import BoardDetail from './pages/BoardDetail'
import CalendarPage from './pages/CalendarPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/login' element={<LoginPage />} />
				<Route path='/signup' element={<SignupPage />} />

				{/* Protected Routes with Layout */}
				<Route path='/' element={<Layout />}>
					<Route path='dashboard' element={<Dashboard />} />
					<Route path='boards/:id' element={<BoardDetail />} />
					<Route path='calendar' element={<CalendarPage />} />
					<Route path='notifications' element={<NotificationsPage />} />
					<Route path='settings' element={<SettingsPage />} />
					<Route index element={<Navigate to='/dashboard' />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App
