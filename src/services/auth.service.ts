import api from './api'
import type { AuthUser } from '@/store/authStore'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: AuthUser
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload).then((r) => r.data),

  me: () =>
    api.get<AuthUser>('/auth/me').then((r) => r.data),
}
