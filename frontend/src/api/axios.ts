import axios from 'axios'
import { useAuthStore } from '../store/auth'

const api = axios.create({
	baseURL: 'http://localhost:8080',
})

api.interceptors.request.use(config => {
	const token = useAuthStore.getState().accessToken
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Add response interceptor for token refresh
api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			const success = await useAuthStore.getState().refreshAuth()
			if (success) {
				const newToken = useAuthStore.getState().accessToken
				originalRequest.headers.Authorization = `Bearer ${newToken}`
				return api(originalRequest)
			}
		}

		return Promise.reject(error)
	}
)

export default api
