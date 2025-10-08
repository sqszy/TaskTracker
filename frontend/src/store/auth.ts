import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
	accessToken: string | null
	refreshToken: string | null
	setTokens: (access: string, refresh: string) => void
	clear: () => void
	refreshAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			accessToken: null,
			refreshToken: null,

			setTokens: (access: string, refresh: string) => {
				set({ accessToken: access, refreshToken: refresh })
			},

			clear: () => {
				set({ accessToken: null, refreshToken: null })
			},

			refreshAuth: async (): Promise<boolean> => {
				const { refreshToken } = get()

				if (!refreshToken) {
					return false
				}

				try {
					const response = await fetch('http://localhost:8080/refresh', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ refresh_token: refreshToken }),
					})

					if (response.ok) {
						const data = await response.json()
						set({ accessToken: data.access_token })
						return true
					}
				} catch (error) {
					console.error('Token refresh failed:', error)
				}

				// If refresh fails, clear tokens
				get().clear()
				return false
			},
		}),
		{
			name: 'auth-storage',
		}
	)
)
