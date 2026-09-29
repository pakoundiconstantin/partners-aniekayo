import { Link, NavLink } from 'react-router-dom'
import { useAppData } from '../services/dataStore'

export function SiteHeader({ partnerArea = false }: { partnerArea?: boolean }) {
  const { data } = useAppData()
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="ANIEK Group Services, accueil"><img src="/media/partners/ANIEKGROUP.webp" alt="ANIEK Group Services" /></Link>
      <nav className="main-nav" aria-label="Navigation principale">
        <NavLink to="/" end>Accueil</NavLink><a href="/#implantations">Nos pays</a>
        <Link to={partnerArea ? '/partners' : '/partners/login'}>{partnerArea ? 'Espace partenaires' : 'Partenaires'}</Link>
        <Link to="/admin/login" className="admin-entry" aria-label="Administration">Administration</Link>
      </nav>
      <div className="flag-nav" aria-label="Nos implantations">{data.countries.map((country) => <a key={country.id} href={`/#${country.id}`} title={country.name} aria-label={country.name}><img src={`/media/flags/${country.flag}`} alt="" /></a>)}</div>
    </header>
  )
}

export function SiteFooter({ onTeamClick }: { onTeamClick?: () => void }) {
  return <footer className="site-footer"><div className="footer-inner"><p>© {new Date().getFullYear()} ANIEK Group Services. Tous droits réservés.</p><div className="footer-links">{onTeamClick && <button type="button" onClick={onTeamClick}>Voir les fiches d’équipe</button>}<a href="https://www.facebook.com/aniekgroup/" target="_blank" rel="noreferrer">Facebook</a><a href="https://www.linkedin.com/company/aniekgroup" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://www.aniekgroup.com/contactus" target="_blank" rel="noreferrer">Contact</a><Link to="/admin/login">Administration</Link></div></div></footer>
}