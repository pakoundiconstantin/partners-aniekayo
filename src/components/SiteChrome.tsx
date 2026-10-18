import { Link, NavLink } from 'react-router-dom'
import { useAppData } from '../services/dataStore'

type CountryNavItem = { id: string; label: string; flag: string }

type SiteHeaderProps = {
  showCountryFlags?: boolean
  countryNavigation?: readonly CountryNavItem[]
  activeCountry?: string
  onCountrySelect?: (id: string) => void
}

export function SiteHeader({ showCountryFlags = true, countryNavigation, activeCountry, onCountrySelect }: SiteHeaderProps) {
  const { data } = useAppData()
  const countries = countryNavigation ?? data.countries.map((country) => ({
    id: country.id,
    label: country.name,
    flag: `/media/flags/${country.flag}`,
  }))

  return (
    <header className="site-header">
      <div className="site-header__main">
        <Link to="/" className="brand" aria-label="ANIEK & AYO Group Services, accueil"><img src="/media/partners/ANIEKGROUP.webp" alt="ANIEK & AYO" /></Link>
        <nav className="main-nav" aria-label="Navigation principale">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'is-active' : ''}>Accueil</NavLink>
          <NavLink to="/partners" className={({ isActive }) => isActive ? 'is-active' : ''}>Partenaires</NavLink>
        </nav>
      </div>
      {showCountryFlags && (
        <div className="flag-nav" aria-label="Choisir un pays">
          {countries.map((country) => (
            onCountrySelect ? (
              <button
                key={country.id}
                type="button"
                className={activeCountry === country.id ? 'is-active' : ''}
                onClick={() => onCountrySelect(country.id)}
                title={country.label}
                aria-label={country.label}
                aria-pressed={activeCountry === country.id}
              >
                <img src={country.flag} alt="" />
              </button>
            ) : (
              <Link key={country.id} to={`/#${country.id}`} title={country.label} aria-label={country.label}>
                <img src={country.flag} alt="" />
              </Link>
            )
          ))}
        </div>
      )}
    </header>
  )
}

export function SiteFooter({ onTeamClick }: { onTeamClick?: () => void }) {
  return <footer className="site-footer"><div className="footer-inner"><p>© {new Date().getFullYear()} ANIEK Group Services. Tous droits réservés.</p><div className="footer-links">{onTeamClick && <button type="button" onClick={onTeamClick}>Voir les fiches d’équipe</button>}<a href="https://www.facebook.com/aniekgroup/" target="_blank" rel="noreferrer">Facebook</a><a href="https://www.linkedin.com/company/aniekgroup" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://www.aniekgroup.com/contactus" target="_blank" rel="noreferrer">Contact</a><Link to="/admin/login">Administration</Link></div></div></footer>
}