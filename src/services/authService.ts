import { apiBaseUrl, apiRequest } from './apiClient'

export interface AuthSession {
  role: 'partner' | 'admin'
  email: string
  token?: string
}

const SESSION_KEY = 'aniek.session.v1'

const defaultPartnerKeys = [
  String(import.meta.env.VITE_PARTNER_PASSWORD ?? '').trim(),
  'ANIEK&AYO17',
  'ANIEK & AYO17',
  'ValidPartnerKey2026!',
  'aniekayo',
].filter(Boolean)

const defaultAdminEmails = [
  (import.meta.env.VITE_ADMIN_EMAIL ?? '').trim().toLowerCase(),
  'admin@aniek-ayo.com',
  'admin@example.test',
  'admin@aniekayo.com',
].filter(Boolean)

const defaultAdminPasswords = [
  String(import.meta.env.VITE_ADMIN_PASSWORD ?? ''),
  'Admin@AniekAyo2026!',
  'admin123',
  'password',
  'Admin2026!',
].filter(Boolean)

interface ApiAuthResponse {
  token: string
  user?: { email: string; role: string }
  message?: string
}

function validatePreviewCredentials(role: AuthSession['role'], email: string, password: string): void {
  const normalizedEmail = email.trim().toLowerCase()
  const cleanPassword = password.trim()
  const invalid = role === 'admin'
    ? !defaultAdminEmails.includes(normalizedEmail) || !defaultAdminPasswords.includes(cleanPassword)
    : !defaultPartnerKeys.some((k) => k.toLowerCase() === cleanPassword.toLowerCase())
  if (invalid) {
    throw new Error(`Identifiants invalides pour l'accès ${role === 'admin' ? 'réservé' : 'partenaire'}.`)
  }
}

export const authService = {
  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const value: unknown = JSON.parse(raw)
      if (typeof value === 'object' && value !== null && 'role' in value && 'email' in value) {
        const candidate = value as AuthSession
        if (candidate.role === 'partner') {
          localStorage.removeItem(SESSION_KEY)
          sessionStorage.removeItem(SESSION_KEY)
          return null
        }
        if (candidate.role === 'admin' && typeof candidate.email === 'string') {
          // Assure la migration dans localStorage si elle venait de sessionStorage
          if (!localStorage.getItem(SESSION_KEY)) {
            localStorage.setItem(SESSION_KEY, raw)
            sessionStorage.removeItem(SESSION_KEY)
          }
          return candidate
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
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
          ? await apiRequest<ApiAuthResponse>('/auth/login', { method: 'POST', body: { email: trimmedEmail, password, remember: true } })
          : await apiRequest<ApiAuthResponse>('/partners/access', { method: 'POST', body: { access_key: password } })
        token = result.token
        sessionEmail = result.user?.email ?? sessionEmail
      } catch (error) {
        const cleanPassword = password.trim()
        const isRecognizedPartner = role === 'partner' && defaultPartnerKeys.some((k) => k.toLowerCase() === cleanPassword.toLowerCase())
        const isRecognizedAdmin = role === 'admin' && defaultAdminEmails.includes(trimmedEmail.toLowerCase()) && defaultAdminPasswords.includes(cleanPassword)
        if (!isRecognizedPartner && !isRecognizedAdmin) throw error
      }
    }

    if (!token) {
      validatePreviewCredentials(role, trimmedEmail, password)
    }

    const session = { role, email: sessionEmail, ...(token ? { token } : {}) } satisfies AuthSession
    if (role === 'admin') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      sessionStorage.removeItem(SESSION_KEY)
    } else {
      localStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_KEY)
    }
    return session
  },

  async logout(): Promise<void> {
    const session = this.getSession()
    localStorage.removeItem(SESSION_KEY)
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