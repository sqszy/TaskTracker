import api from './axios'

export interface LoginRequest {
	email: string
	password: string
}

export interface SignupRequest {
	email: string
	password: string
}

export interface AuthResponse {
	access_token: string
	refresh_token: string
}

// POST /login
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
	const r = await api.post('/login', credentials)
	return r.data
}

// POST /signup
export async function signup(
	credentials: SignupRequest
): Promise<AuthResponse> {
	const r = await api.post('/signup', credentials)
	return r.data
}

// POST /refresh
export async function refreshToken(
	refreshToken: string
): Promise<AuthResponse> {
	const r = await api.post('/refresh', { refresh_token: refreshToken })
	return r.data
}

// POST /logout
export async function logout(): Promise<void> {
	await api.post('/logout')
}

// GET /protected/me
export async function getCurrentUser() {
	const r = await api.get('/protected/me')
	return r.data
}
