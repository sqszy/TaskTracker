import axios from 'axios'
import { useAuthStore } from '../store/auth'

const api = axios.create({
	baseURL: 'http://localhost:8080',
})

// Request interceptor
api.interceptors.request.use(config => {
	const token = useAuthStore.getState().accessToken
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Response interceptor for token refresh
api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			try {
				const success = await useAuthStore.getState().refreshAuth()
				if (success) {
					const newToken = useAuthStore.getState().accessToken
					if (newToken) {
						originalRequest.headers.Authorization = `Bearer ${newToken}`
						return api(originalRequest)
					}
				}
			} catch (refreshError) {
				console.error('Token refresh failed:', refreshError)
				useAuthStore.getState().clear()
				window.location.href = '/dashboard'
			}
		}

		return Promise.reject(error)
	}
)

export default api
