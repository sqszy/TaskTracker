import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
	accessToken: string | null
	refreshToken: string | null
	userEmail: string | null

	setTokens: (access: string, refresh: string | null) => void
	setUserEmail: (email: string | null) => void
	clear: () => void
	refreshAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			accessToken: null,
			refreshToken: null,
			userEmail: null,

			setTokens: (access: string, refresh: string | null) => {
				set({ accessToken: access, refreshToken: refresh })
			},

			setUserEmail: (email: string | null) => {
				set({ userEmail: email })
			},

			clear: () => {
				set({ accessToken: null, refreshToken: null, userEmail: null })
			},

			refreshAuth: async (): Promise<boolean> => {
				const { refreshToken } = get()

				if (!refreshToken) {
					return false
				}

				try {
					const res = await fetch('http://localhost:8080/refresh', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ refresh_token: refreshToken }),
					})

					if (!res.ok) {
						get().clear()
						return false
					}

					const data = await res.json()
					const access = data.access_token || data.accessToken || data.token
					const refresh = data.refresh_token || data.refreshToken || null

					if (!access) {
						get().clear()
						return false
					}

					set({
						accessToken: access,
						refreshToken: refresh ?? get().refreshToken,
					})
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
			partialize: state => ({
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
				userEmail: state.userEmail,
			}),
		}
	)
)
