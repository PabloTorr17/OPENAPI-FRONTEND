import api from './api'
import type { AuthUser } from '@/store/authStore'

// ─── Tipos alineados con el OpenAPI del backend ────────────────────────────────

interface LoginPayload {
  username: string
  password: string
}

/** Respuesta real del backend: POST /auth/login */
interface LoginApiResponse {
  token: string
  tipo: 'Bearer'
  expira_en: number // segundos
}

/** Lo que devuelve authService.login al store */
interface LoginResult {
  token: string
  user: AuthUser
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
// Activa el mock mientras el backend no esté disponible.
// Cuando el backend esté listo: cambia USE_MOCK a false (o borra el bloque).

const USE_MOCK = true

/** Usuarios de prueba del README del backend (password: "password123") */
const MOCK_USERS: Record<string, AuthUser & { password: string }> = {
  admin01:   { id: 1, nombre: 'Admin',      email: 'admin01@sistema.edu',    rol: 'admin',   password: 'password123' },
  docente01: { id: 2, nombre: 'Docente 01', email: 'docente01@sistema.edu',  rol: 'docente', password: 'password123' },
  docente02: { id: 3, nombre: 'Docente 02', email: 'docente02@sistema.edu',  rol: 'docente', password: 'password123' },
  alumno01:  { id: 4, nombre: 'Alumno 01',  email: 'alumno01@sistema.edu',   rol: 'alumno',  password: 'password123' },
  alumno02:  { id: 5, nombre: 'Alumno 02',  email: 'alumno02@sistema.edu',   rol: 'alumno',  password: 'password123' },
  alumno03:  { id: 6, nombre: 'Alumno 03',  email: 'alumno03@sistema.edu',   rol: 'alumno',  password: 'password123' },
}

async function mockLogin({ username, password }: LoginPayload): Promise<LoginResult> {
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 600))

  const found = MOCK_USERS[username]
  if (!found || found.password !== password) {
    // Imita la respuesta 401 del backend
    throw Object.assign(new Error('Credenciales inválidas'), {
      response: { status: 401 },
    })
  }

  const { password: _pw, ...user } = found
  return {
    token: `mock-jwt-token-for-${username}`,
    user,
  }
}

// ─── Servicio real ─────────────────────────────────────────────────────────────

async function realLogin(payload: LoginPayload): Promise<LoginResult> {
  const { data } = await api.post<LoginApiResponse>('/auth/login', payload)

  // El backend devuelve token pero no el usuario: hay que pedirlo aparte.
  // Si el backend luego incluye el usuario en el login, simplifica esto.
  const user = await api.get<AuthUser>('/auth/me').then((r) => r.data)

  return { token: data.token, user }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const authService = {
  login: (payload: LoginPayload): Promise<LoginResult> =>
    USE_MOCK ? mockLogin(payload) : realLogin(payload),
}