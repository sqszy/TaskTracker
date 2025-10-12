import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
	accessToken: string | null
	refreshToken: string | null
	setTokens: (access: string, refresh: string | null) => void
	clear: () => void
	refreshAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			accessToken: null,
			refreshToken: null,

			setTokens: (access: string, refresh: string | null) => {
				set({ accessToken: access, refreshToken: refresh })
			},

			clear: () => {
				set({ accessToken: null, refreshToken: null })
			},

			refreshAuth: async (): Promise<boolean> => {
				const { refreshToken } = get()

				if (!refreshToken) {
					console.warn('[auth] no refresh token available')
					return false
				}

				try {
					console.log('[auth] calling /refresh with refreshToken')
					const res = await fetch('http://localhost:8080/refresh', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ refresh_token: refreshToken }),
					})

					if (!res.ok) {
						console.warn('[auth] /refresh responded with', res.status)
						get().clear()
						return false
					}

					const data = await res.json()
					const access = data.access_token || data.accessToken || data.token
					const refresh = data.refresh_token || data.refreshToken || null

					if (!access) {
						console.warn('[auth] /refresh response missing access token', data)
						get().clear()
						return false
					}

					set({
						accessToken: access,
						refreshToken: refresh ?? get().refreshToken,
					})
					console.log('[auth] token refreshed successfully')
					return true
				} catch (err) {
					console.error('[auth] refreshAuth failed', err)
					get().clear()
					return false
				}
			},
		}),
		{
			name: 'auth-storage',
		}
	)
)
