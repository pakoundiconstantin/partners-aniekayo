import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PartnersPage } from './pages/PartnersPage'
import { authService, type AuthSession } from './services/authService'
import { AppDataProvider } from './services/dataContext'
import './App.css'

interface AuthContextValue {
  session: AuthSession | null
  signIn: (role: AuthSession['role'], email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans AuthContext.')
  return context
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => authService.getSession())

  async function signIn(role: AuthSession['role'], email: string, password: string) {
    const nextSession = await authService.login(role, email, password)
    setSession(nextSession)
  }

  async function signOut() {
    try {
      await authService.logout()
    } finally {
      setSession(null)
    }
  }

  return <AuthContext.Provider value={{ session, signIn, signOut }}>{children}</AuthContext.Provider>
}

function LoginRoute({ role }: { role: AuthSession['role'] }) {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()

  if (session?.role === role) return <Navigate to={role === 'admin' ? '/admin' : '/partners'} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>, email: string, password: string) {
    event.preventDefault()
    await signIn(role, email, password)
    navigate(role === 'admin' ? '/admin' : '/partners', { replace: true })
  }

  return <LoginPage role={role} onSubmit={handleSubmit} />
}

function ProtectedRoute({ role, children }: { role: AuthSession['role']; children: ReactNode }) {
  const { session } = useAuth()
  if (!session || session.role !== role) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/partners/login'} replace />
  }
  return children
}

function AppRoutes() {
  const { session, signOut } = useAuth()

  useEffect(() => {
    function useHistoricalImage(event: Event) {
      const image = event.target
      if (!(image instanceof HTMLImageElement) || image.dataset.fallbackUsed) return

      const pathname = new URL(image.src).pathname
      const filename = decodeURIComponent(pathname.split('/').pop() ?? '')
      const fallback = pathname.includes('/storage/partners/logos/')
        ? `/media/partners/${encodeURIComponent(filename)}`
        : /\/storage\/[^/]+\/\d+\.webp$/.test(pathname)
          ? `/media/team/${encodeURIComponent(filename)}`
          : ''

      if (!fallback) return
      image.dataset.fallbackUsed = 'true'
      image.src = fallback
    }

    window.addEventListener('error', useHistoricalImage, true)
    return () => window.removeEventListener('error', useHistoricalImage, true)
  }, [])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/partners/login" element={<LoginRoute role="partner" />} />
      <Route path="/admin/login" element={<LoginRoute role="admin" />} />
      <Route path="/partners" element={<ProtectedRoute role="partner"><PartnersPage /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute role="admin"><AdminPage email={session?.email ?? ''} onLogout={signOut} /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return <BrowserRouter><AuthProvider><AppDataProvider><AppRoutes /></AppDataProvider></AuthProvider></BrowserRouter>
}

export default App
