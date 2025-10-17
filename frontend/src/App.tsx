import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'

import Dashboard from './pages/Dashboard'
import BoardDetail from './pages/BoardDetail'
import CalendarPage from './pages/CalendarPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import { ModalProvider } from './context/ModalContext'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/ToastContainer'

function App() {
	return (
		<ToastProvider>
			<ModalProvider>
				<BrowserRouter>
					<Routes>
						<Route path='/' element={<Layout />}>
							<Route path='dashboard' element={<Dashboard />} />
							<Route path='boards/:id' element={<BoardDetail />} />
							<Route path='calendar' element={<CalendarPage />} />
							<Route path='notifications' element={<NotificationsPage />} />
							<Route path='settings' element={<SettingsPage />} />
							<Route index element={<Navigate to='/dashboard' />} />
						</Route>
					</Routes>
					<ToastContainer />
				</BrowserRouter>
			</ModalProvider>
		</ToastProvider>
	)
}

export default App
