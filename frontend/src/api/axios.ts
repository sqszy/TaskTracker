import axios from 'axios'
import { useAuthStore } from '../store/auth'

const api = axios.create({
	baseURL: 'http://localhost:8080',
})

let refreshPromise: Promise<boolean> | null = null

api.interceptors.request.use(config => {
	try {
		const token = useAuthStore.getState().accessToken
		if (token && config && config.headers) {
			config.headers.Authorization = `Bearer ${token}`
		}
	} catch (err) {
		console.error('Request interceptor error', err)
	}
	return config
})

api.interceptors.response.use(
	res => res,
	async error => {
		const originalRequest = error.config

		if (!originalRequest || !error.response) {
			return Promise.reject(error)
		}

		const status = error.response.status

		if (originalRequest.url && originalRequest.url.includes('/refresh')) {
			return Promise.reject(error)
		}

		if (status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			if (!refreshPromise) {
				console.log('[api] starting token refresh')
				refreshPromise = useAuthStore
					.getState()
					.refreshAuth()
					.then(success => {
						refreshPromise = null
						return success
					})
					.catch(err => {
						refreshPromise = null
						console.error('[api] refreshAuth threw:', err)
						return false
					})
			} else {
				console.log('[api] waiting ongoing refresh')
			}

			const success = await refreshPromise

			if (success) {
				const newToken = useAuthStore.getState().accessToken
				if (newToken) {
					originalRequest.headers = originalRequest.headers || {}
					originalRequest.headers.Authorization = `Bearer ${newToken}`
					return api.request(originalRequest)
				}
			} else {
				console.warn('[api] token refresh failed, clearing auth')
				useAuthStore.getState().clear()
				window.location.href = '/dashboard'
				return Promise.reject(error)
			}
		}

		return Promise.reject(error)
	}
)

export default api
