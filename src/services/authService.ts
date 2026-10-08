import { apiBaseUrl, apiRequest } from './apiClient'

export interface AuthSession {
  role: 'partner' | 'admin'
  email: string
  token?: string
}

const SESSION_KEY = 'aniek.session.v1'

const previewCredentials = {
  partner: { password: String(import.meta.env.VITE_PARTNER_PASSWORD ?? '') },
  admin: {
    email: (import.meta.env.VITE_ADMIN_EMAIL ?? '').trim().toLowerCase(),
    password: String(import.meta.env.VITE_ADMIN_PASSWORD ?? ''),
  },
} as const

interface ApiAuthResponse {
  token: string
  user?: { email: string; role: string }
  message?: string
}

function validatePreviewCredentials(role: AuthSession['role'], email: string, password: string): void {
  const normalizedEmail = email.trim().toLowerCase()
  const invalid = role === 'admin'
    ? normalizedEmail !== previewCredentials.admin.email || password !== previewCredentials.admin.password
    : password !== previewCredentials.partner.password
  if (invalid) {
    throw new Error(`Identifiants invalides pour l'accès ${role === 'admin' ? 'administrateur' : 'partenaire'}.`)
  }
}

export const authService = {
  getSession(): AuthSession | null {
    try {
      const value: unknown = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')
      if (typeof value === 'object' && value !== null && 'role' in value && 'email' in value) {
        const candidate = value as AuthSession
        if (candidate.role === 'partner') {
          sessionStorage.removeItem(SESSION_KEY)
          return null
        }
        if (candidate.role === 'admin' && typeof candidate.email === 'string') return candidate
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY)
    }
    return null
  },

  async login(role: AuthSession['role'], email: string, password: string): Promise<AuthSession> {
    const trimmedEmail = email.trim()
    if ((role === 'admin' && !trimmedEmail) || !password) {
      throw new Error(role === 'admin' ? 'Veuillez renseigner votre adresse e-mail et votre mot de passe.' : 'Veuillez renseigner la clé d’accès partenaire.')
    }

    let token: string | undefined
    let sessionEmail = role === 'admin' ? trimmedEmail : ''
    if (apiBaseUrl) {
      try {
        const result = role === 'admin'
          ? await apiRequest<ApiAuthResponse>('/auth/login', { method: 'POST', body: { email: trimmedEmail, password, remember: false } })
          : await apiRequest<ApiAuthResponse>('/partners/access', { method: 'POST', body: { access_key: password } })
        token = result.token
        sessionEmail = result.user?.email ?? sessionEmail
      } catch (error) {
        const isPreviewPartnerCredential = role === 'partner' && password === previewCredentials.partner.password
        if (!isPreviewPartnerCredential) throw error
      }
    }

    if (!token) {
      validatePreviewCredentials(role, trimmedEmail, password)
    }

    const session = { role, email: sessionEmail, ...(token ? { token } : {}) } satisfies AuthSession
    if (role === 'admin') sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(SESSION_KEY)
    return session
  },

  async logout(): Promise<void> {
    const session = this.getSession()
    sessionStorage.removeItem(SESSION_KEY)

    if (apiBaseUrl && session?.role === 'admin' && session.token) {
      void apiRequest('/auth/logout', {
        method: 'POST',
        token: session.token,
        signal: AbortSignal.timeout(10000),
      }).catch(() => undefined)
    }
  },
}