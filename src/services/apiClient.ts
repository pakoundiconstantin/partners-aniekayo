export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

interface ApiErrorPayload {
  message?: string
  errors?: Record<string, string[]>
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
  signal?: AbortSignal
}

let csrfCookieRequest: Promise<void> | undefined

function readXsrfCookie(): string {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='))
  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : ''
}

async function ensureCsrfCookie(): Promise<void> {
  if (!apiBaseUrl) return
  if (readXsrfCookie()) return
  if (!csrfCookieRequest) {
    csrfCookieRequest = fetch(`${apiBaseUrl}/sanctum/csrf-cookie`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    }).then((response) => {
      if (!response.ok) {
        console.warn(`[sanctum/csrf-cookie] Réponse HTTP ${response.status}`)
      }
    }).catch((error: unknown) => {
      console.warn('[sanctum/csrf-cookie] Non disponible en cross-origin, poursuite avec authentification Token API.', error)
    })
  }
  try {
    await csrfCookieRequest
  } finally {
    csrfCookieRequest = undefined
  }
}

export function warmupCsrfCookie(): void {
  void ensureCsrfCookie().catch(() => undefined)
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!apiBaseUrl) throw new Error('L’URL de l’API n’est pas configurée.')

  const { method = 'GET', body, token, signal } = options
  const changesState = method !== 'GET'
  const usesPartnerSession = path === '/partners/documents' || path.startsWith('/partners/documents/')
  if (changesState) await ensureCsrfCookie()

  const isFormData = body instanceof FormData
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(changesState && readXsrfCookie() ? { 'X-XSRF-TOKEN': readXsrfCookie() } : {}),
        ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: changesState || usesPartnerSession ? 'include' : 'omit',
      body: body ? isFormData ? body : JSON.stringify(body) : undefined,
      signal,
    })
  } catch {
    throw new Error('Impossible de joindre l’API Laravel. Vérifiez que le serveur est démarré et que CORS autorise le frontend.')
  }
  const payload: unknown = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status >= 500) {
      const isAuthenticationRequest = path === '/auth/login' || path === '/partners/access'
      throw new Error(isAuthenticationRequest
        ? 'Le service de connexion est en erreur. Vérifiez la configuration du serveur auprès du support.'
        : 'Les données du serveur sont momentanément indisponibles. Réessayez plus tard.')
    }
    const error = payload as ApiErrorPayload
    const validationMessage = error.errors ? Object.values(error.errors).flat()[0] : undefined
    throw new Error(error.message ?? validationMessage ?? 'Le serveur n’a pas pu traiter la demande.')
  }

  return payload as T
}

export function apiMediaUrl(path?: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const normalizedPath = path.replace(/^\/?(?:storage\/)?/, '')
  if (normalizedPath.startsWith('media/partners/')) {
    return apiBaseUrl ? `${apiBaseUrl}/${normalizedPath}` : `/${normalizedPath}`
  }
  return apiBaseUrl ? `${apiBaseUrl}/storage/${normalizedPath}` : `/media/${normalizedPath}`
}
