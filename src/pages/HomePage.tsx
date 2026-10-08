import { ArrowDown, ArrowRight, ArrowUpRight, Building2, Factory, HardHat, Mail, MapPin, Phone, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { homepageContentStorageKey, initialHomepageContent } from '../data/homepageDefaults'
import { NormalizedLogo } from '../components/NormalizedLogo'
import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import { initialSnapshot } from '../data/initialData'
import { getHomepageContent } from '../services/adminApi'
import { apiBaseUrl } from '../services/apiClient'
import { useAppData } from '../services/dataStore'
import type { Country } from '../types/domain'
import dgPortrait from '../../../backup/image/DG.jpg'
import './HomePage.css'

const countryOrder = ['togo', 'mali', 'cote-d-ivoire', 'burkina-faso', 'niger']

function countryFromLocation(search: string, hash: string): string {
  const requestedCountry = new URLSearchParams(search).get('pays') ?? hash.slice(1)
  return countryOrder.includes(requestedCountry) ? requestedCountry : countryOrder[0]
}

const countryFlags: Record<string, string> = {
  togo: 'togo.png',
  mali: 'drapoMali.png',
  'cote-d-ivoire': 'CI.png',
  'burkina-faso': 'burkina-faso.jpg',
  niger: 'niger.jpg',
}

const expertiseIcons = { Factory, HardHat, Wrench, Building2 }

function CountryCard({ country, index, tabId }: { country: Country; index: number; tabId: string }) {
  const flag = country.flag || countryFlags[country.id]
  const location = [country.city, country.address]
    .filter(Boolean)
    .join(' · ')
    .replace(/(?:\s*\|\s*){2,}/g, ' | ')

  return (
    <article className="home-country home-country--selected" id={country.id} role="tabpanel" aria-labelledby={tabId}>
      <div className="home-country__identity">
        <div className="home-country__heading">
          <img src={`/media/flags/${flag}`} alt="" />
          <div>
            <span className="home-country__index">0{index + 1} / 05</span>
            <h3>{country.name}</h3>
          </div>
        </div>
        {country.agencyName && <p className="home-country__agency">{country.agencyName}</p>}
      </div>
      <div className="home-country__contacts">
        {location && <p className="home-country__detail"><MapPin size={16} aria-hidden="true" /><span><small>ADRESSE</small>{location}</span></p>}
        {country.commercialNumber && country.phone && country.commercialNumber !== country.phone && <p className="home-country__detail"><Phone size={16} aria-hidden="true" /><span><small>NUMÉRO COMMERCIAL</small><a href={`tel:${country.commercialNumber.replace(/[\s().-]/g, '')}`}>{country.commercialNumber}</a></span></p>}
        {country.phone && <p className="home-country__detail"><Phone size={16} aria-hidden="true" /><span><small>{country.phoneLabel?.toLocaleUpperCase('fr') ?? 'TÉLÉPHONE'}</small><a href={`tel:${country.phone.replace(/[\s().-]/g, '')}`}>{country.phone}</a></span></p>}
        {country.email && <p className="home-country__detail"><Mail size={16} aria-hidden="true" /><span><small>E-MAIL</small><a href={`mailto:${country.email}`}>{country.email}</a></span></p>}
        {!location && !country.phone && !country.email && <p className="home-country__empty">Coordonnées à venir</p>}
      </div>
      <div className="home-country__legal">
        {country.registration && <p><small>REGISTRE DE COMMERCE</small><span>{country.registration}</span></p>}
        {country.taxNumber && <p><small>IMMATRICULATION FISCALE</small><span>{country.taxNumber}</span></p>}
        {country.postOfficeBox && <p><small>BOÎTE POSTALE</small><span>{country.postOfficeBox}</span></p>}
      </div>
      {!!country.monthlyReminders?.length && (
        <section className="home-country__reminders" aria-label="Rappels mensuels">
          <h4>Rappels mensuels</h4>
          <dl>{country.monthlyReminders.map((reminder) => <div key={reminder.label}><dt>{reminder.label}</dt><dd>{reminder.value}</dd></div>)}</dl>
          {country.reminderNote && <p>{country.reminderNote}</p>}
        </section>
      )}
      {!!country.portals?.length && (
        <section className="home-country__portals" aria-label={`Portails et services pour ${country.name}`}>
          <div className="home-country__portals-heading"><div><small>RESSOURCES LOCALES</small><h4>Portails et services</h4></div><span>{country.portals.length} liens</span></div>
          <div className="home-country__portal-grid">
            {country.portals.map((portal) => (
              <article className="home-portal-card" key={`${portal.website}|${portal.image}`}>
                <a className="home-portal-card__image" href={portal.website || undefined} target={portal.website ? '_blank' : undefined} rel={portal.website ? 'noreferrer' : undefined} aria-label={`Ouvrir ${portal.name}`}>
                  <NormalizedLogo source={portal.image} name={portal.name} />
                </a>
                <p>{portal.name}</p>
                {portal.website ? <a className="home-portal-card__link" href={portal.website} target="_blank" rel="noreferrer">Ouvrir le site <ArrowUpRight size={14} aria-hidden="true" /></a> : <span className="home-portal-card__unavailable">Lien indisponible</span>}
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export function HomePage() {
  const { data } = useAppData()
  const [homepage, setHomepage] = useState(() => {
    if (apiBaseUrl) return initialHomepageContent
    try {
      return JSON.parse(localStorage.getItem(homepageContentStorageKey) ?? 'null') as typeof initialHomepageContent | null ?? initialHomepageContent
    } catch {
      return initialHomepageContent
    }
  })
  const location = useLocation()
  const navigate = useNavigate()
  const countries = countryOrder.flatMap((id) => {
    const country = data.countries.find((item) => item.id === id)
      ?? initialSnapshot.countries.find((item) => item.id === id)
    return country ? [country] : []
  })
  const activeCountryId = countryFromLocation(location.search, location.hash)
  const activeCountry = countries.find((country) => country.id === activeCountryId) ?? countries[0]
  const countryNavigation = countries.map((country) => ({
    id: country.id,
    label: country.name,
    flag: `/media/flags/${country.flag || countryFlags[country.id]}`,
  }))

  useEffect(() => {
    if (!apiBaseUrl) return
    let active = true
    void getHomepageContent().then((content) => {
      if (active) setHomepage(content)
    }).catch(() => undefined)
    return () => { active = false }
  }, [])

  function showCountry(countryId: string) {
    navigate({ pathname: '/', search: `?pays=${encodeURIComponent(countryId)}`, hash: '#implantations' }, { preventScrollReset: true })
    document.getElementById('implantations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <SiteHeader countryNavigation={countryNavigation} activeCountry={activeCountryId} onCountrySelect={showCountry} />
      <main className="home-page">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero__inner">
            <div className="home-hero__copy">
              <p className="home-eyebrow"><span /> {homepage.hero.eyebrow}</p>
              <h1 id="home-title">{homepage.hero.title} <em>{homepage.hero.highlight}</em></h1>
              <p className="home-hero__intro">{homepage.hero.description}</p>
              <div className="home-hero__actions">
                <a className="home-button home-button--primary" href="#expertises">Découvrir nos métiers <ArrowRight size={17} aria-hidden="true" /></a>
                <a className="home-button home-button--text" href="#implantations">Nos implantations <ArrowDown size={16} aria-hidden="true" /></a>
              </div>
              <div className="home-hero__proof"><strong>5</strong><span>pays d’implantation<br />en Afrique de l’Ouest</span><span className="home-hero__proof-line" /><span>Togo · Mali · Côte d’Ivoire<br />Burkina Faso · Niger</span></div>
            </div>
            <figure className="home-hero__photo">
              <img src={homepage.hero.image} alt={homepage.hero.title} fetchPriority="high" />
              <figcaption><span>MAINTENANCE INDUSTRIELLE</span></figcaption>
            </figure>
          </div>
          <a className="home-scroll-cue" href="#expertises" aria-label="Défiler vers nos métiers"><span /> DÉFILER POUR DÉCOUVRIR</a>
        </section>

        <section className="home-director" aria-labelledby="director-title">
          <div className="home-director__inner">
            <div className="home-director__copy">
              <p className="home-eyebrow home-eyebrow--dark">ANIEK &amp; AYO SARL</p>
              <h2 id="director-title">Le Directeur Général</h2>
              <p>Fondée en 2017, ANIEK &amp; AYO accompagne les entreprises d’Afrique de l’Ouest avec des solutions d’équipements industriels, d’ingénierie et de maintenance adaptées aux réalités du terrain.</p>
            </div>
            <figure className="home-director__portrait">
              <img src={dgPortrait} alt="Portrait du Directeur Général d’ANIEK & AYO" loading="lazy" />
              <figcaption>Directeur Général <span>ANIEK &amp; AYO SARL</span></figcaption>
            </figure>
          </div>
        </section>

        <section className="home-expertise" id="expertises" aria-labelledby="expertise-title">
          <div className="home-section-heading">
            <div><p className="home-eyebrow home-eyebrow--dark">{homepage.expertise.eyebrow}</p><h2 id="expertise-title">{homepage.expertise.title}</h2></div>
            <p>{homepage.expertise.description}</p>
          </div>
          <div className="home-expertise-grid">
            {homepage.expertise.items.map(({ title, description, icon }, index) => {
              const Icon = expertiseIcons[icon] ?? Building2
              return (
              <article className="home-expertise-item" key={title}>
                <span className="home-expertise-item__number">0{index + 1}</span>
                <Icon size={25} strokeWidth={1.6} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
              )
            })}
          </div>
        </section>

        <section className="home-presence" id="implantations" aria-labelledby="presence-title">
          <div className="home-section-heading home-section-heading--presence">
            <div><p className="home-eyebrow home-eyebrow--dark">{homepage.presence.eyebrow}</p><h2 id="presence-title">{homepage.presence.title}</h2></div>
            <p>{homepage.presence.description}</p>
          </div>
          <div className="home-country-tabs" role="tablist" aria-label="Choisir un pays">
            {countries.map((country, index) => (
              <button key={country.id} type="button" role="tab" id={`country-tab-${country.id}`} aria-controls={country.id} aria-selected={activeCountryId === country.id} className={activeCountryId === country.id ? 'is-active' : ''} onClick={() => showCountry(country.id)}>
                <img src={`/media/flags/${country.flag || countryFlags[country.id]}`} alt="" />
                <span>{country.name}</span>
                <small>0{index + 1}</small>
              </button>
            ))}
          </div>
          {activeCountry && <CountryCard country={activeCountry} index={countryOrder.indexOf(activeCountry.id)} tabId={`country-tab-${activeCountry.id}`} />}
        </section>

        <section className="home-companies" aria-labelledby="companies-title">
          <div className="home-companies__intro"><p className="home-eyebrow home-eyebrow--dark">{homepage.companies.eyebrow}</p><h2 id="companies-title">{homepage.companies.title}</h2></div>
          <div className="home-companies__grid">
            {homepage.companies.items.map((company) => (
              company.href
                ? <a className="home-company-logo" href={company.href} target="_blank" rel="noreferrer" key={company.name} aria-label={`Visiter le site de ${company.name}`}><img src={company.image} alt={company.name} /></a>
                : <div className="home-company-logo" key={company.name}><img src={company.image} alt={company.name} /></div>
            ))}
          </div>
        </section>

        <section className="home-partner-callout" id="partenaires">
          <div><p className="home-eyebrow">{homepage.partnerCallout.eyebrow}</p><h2>{homepage.partnerCallout.title}</h2><p>{homepage.partnerCallout.description}</p></div>
          <Link className="home-button home-button--light" to={homepage.partnerCallout.href}>{homepage.partnerCallout.buttonLabel} <ArrowRight size={17} aria-hidden="true" /></Link>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}