import { useEffect, useState } from 'react'
import { ArrowRight, Building2, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import { useAppData } from '../services/dataStore'
import './HomePage.css'

const companyServices = [
  { name: 'Équipements miniers', detail: 'Solutions et équipements pour les opérations minières.' },
  { name: 'BTP & construction', detail: 'Matériel, approvisionnement et accompagnement de chantier.' },
  { name: 'Maintenance industrielle', detail: 'Entretien et support pour les équipements lourds.' },
  { name: 'Pièces de rechange', detail: 'Pièces industrielles et composants certifiés.' },
  { name: 'Ingénierie & outillage', detail: 'Expertise technique et équipements spécialisés.' },
]

export function HomePage() {
  const { data } = useAppData()
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const initialId = window.location.hash.slice(1)
    return data.countries.some((item) => item.id === initialId) ? initialId : data.countries[0]?.id ?? 'togo'
  })
  const country = data.countries.find((item) => item.id === selectedCountry) ?? data.countries[0]

  useEffect(() => {
    function syncCountryFromHash() {
      const countryId = window.location.hash.slice(1)
      if (data.countries.some((item) => item.id === countryId)) setSelectedCountry(countryId)
    }
    syncCountryFromHash()
    window.addEventListener('hashchange', syncCountryFromHash)
    return () => window.removeEventListener('hashchange', syncCountryFromHash)
  }, [data.countries])

  return <>
<SiteHeader />
<main className="public-page">
<section className="public-intro">
<div className="intro-copy">
<p className="eyebrow">ANIEK GROUP SERVICES · AFRIQUE DE L’OUEST</p>
<h1>Des solutions industrielles, <span>au plus près de vos projets.</span>
</h1>
<p>Équipements, ingénierie, BTP et maintenance : nous accompagnons les entreprises dans cinq pays d’Afrique de l’Ouest.</p>
<Link className="primary-button intro-action" to="/partners/login">Découvrir nos partenaires <ArrowRight size={17} />
</Link>
</div>
<div className="intro-visual" aria-label="ANIEK Group Services">
<img src="/media/partners/ANIEKGROUP.webp" alt="ANIEK Group Services" />
<div className="visual-caption">
<strong>5</strong>
<span>pays d’implantation</span>
</div>
</div>
</section>
<section className="service-section" aria-labelledby="services-title">
<div className="section-heading">
<p className="eyebrow">NOS DOMAINES D’ACTIVITÉ</p>
<h2 id="services-title">Une expertise au service de l’industrie</h2>
</div>
<div className="service-grid">{companyServices.map((service, index) => <article className="service-item" key={service.name}>
<span className="service-number">0{index + 1}</span>
<h3>{service.name}</h3>
<p>{service.detail}</p>
</article>)}</div>
</section>
<section className="country-section" id="implantations" aria-labelledby="countries-title">
<div className="section-heading">
<p className="eyebrow">NOTRE PRÉSENCE RÉGIONALE</p>
<h2 id="countries-title">Nos implantations</h2>
</div>
<div className="country-picker" role="tablist" aria-label="Choisir un pays">{data.countries.map((item) => <button type="button" key={item.id} role="tab" aria-selected={selectedCountry === item.id} className={selectedCountry === item.id ? 'country-tab is-active' : 'country-tab'} onClick={() => setSelectedCountry(item.id)}>
<img src={`/media/flags/${item.flag}`} alt="" />{item.name}</button>)}</div>
{country && <article className="country-detail" id={country.id}>
<div className="country-title">
<img src={`/media/flags/${country.flag}`} alt="" />
<div>
<p className="eyebrow">FILIALE ANIEK</p>
<h3>{country.name}</h3>
</div>
</div>
{country.portals?.length ? <div className="country-portals" aria-label={`Portails de services pour ${country.name}`}>
{country.portals.map((portal) => <a className="country-portal" key={`${portal.website}|${portal.image}`} href={portal.website || undefined} target={portal.website ? '_blank' : undefined} rel="noreferrer">
<img src={portal.image} alt="" loading="lazy" />
<span>{portal.name}</span>
</a>)}
</div> : null}
<div className="country-contact-grid">
<div>
<MapPin size={18} />
<span>
<small>Adresse</small>{country.address || 'Coordonnées à compléter'}</span>
</div>
<div>
<Phone size={18} />
<span>
<small>Téléphone</small>{country.phone ? <a href={`tel:${country.phone.replace(/[\s().-]/g, '')}`}>{country.phone}</a> : 'Coordonnées à compléter'}</span>
</div>
<div>
<Mail size={18} />
<span>
<small>E-mail</small>{country.email ? <a href={`mailto:${country.email}`}>{country.email}</a> : 'Coordonnées à compléter'}</span>
</div>
<div>
<Building2 size={18} />
<span>
<small>Responsable de filiale</small>{country.director || 'Information à compléter'}</span>
</div>
</div>
{(country.registration || country.taxNumber) && <div className="country-legal">
<span>Registre : {country.registration || '—'}</span>
<span>Immatriculation fiscale : {country.taxNumber || '—'}</span>
</div>}</article>}</section>
<section className="partner-callout">
<div>
<p className="eyebrow">UN RÉSEAU INTERNATIONAL</p>
<h2>Nos partenaires industriels</h2>
<p>Retrouvez les marques et équipementiers avec lesquels nous travaillons.</p>
</div>
<Link className="outline-button" to="/partners/login">Accéder à l’espace <ArrowRight size={17} />
</Link>
</section>
</main>
<SiteFooter />
</>
}