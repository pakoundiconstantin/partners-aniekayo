import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { SiteHeader } from '../components/SiteChrome'
import { warmupCsrfCookie } from '../services/apiClient'
import type { AuthSession } from '../services/authService'

export function LoginPage({ role, onSubmit }: { role: AuthSession['role']; onSubmit: (event: FormEvent<HTMLFormElement>, email: string, password: string) => Promise<void> }) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isAdmin = role === 'admin'

  useEffect(() => {
    warmupCsrfCookie()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      await onSubmit(event, String(form.get('email') ?? ''), String(form.get('password') ?? ''))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Connexion impossible. Réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  return <><SiteHeader /><main className="login-page"><section className="login-panel"><Link className="back-link" to="/"><ArrowLeft size={16} /> Retour au site</Link><div className="login-mark"><LockKeyhole size={22} /></div><p className="eyebrow">ANIEK GROUP SERVICES</p><h1>{isAdmin ? 'Administration' : 'Espace partenaires'}</h1><p className="login-intro">{isAdmin ? 'Connectez-vous pour gérer les contenus du groupe.' : 'Connectez-vous pour consulter notre réseau de partenaires.'}</p><form className="login-form" onSubmit={handleSubmit}>{isAdmin && <><label htmlFor="login-email">Adresse e-mail</label><div className="input-with-icon"><Mail size={17} /><input id="login-email" name="email" type="email" autoComplete="username" placeholder="nom@entreprise.com" required /></div></>}<label htmlFor="login-password">{isAdmin ? 'Mot de passe' : 'Clé d’accès partenaire'}</label><div className="input-with-icon"><LockKeyhole size={17} /><input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder={isAdmin ? 'Votre mot de passe' : 'Votre clé d’accès'} required /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button login-submit" type="submit" disabled={submitting}>{submitting ? 'Connexion…' : 'Se connecter'}</button></form><p className="prototype-note">{import.meta.env.VITE_API_BASE_URL ? 'Connexion sécurisée par le serveur ANIEK.' : 'Mode aperçu local : les identifiants de test ne sécurisent pas les comptes.'}</p>{!isAdmin && <Link className="admin-login-link" to="/admin/login">Accès administrateur</Link>}</section></main></>
}