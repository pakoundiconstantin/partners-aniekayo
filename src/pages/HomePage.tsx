import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import './HomePage.css'

const countryNav = [
  { id: 'togo', label: 'Togo', flag: '/media/legacy/togo.png' },
  { id: 'mali', label: 'Mali', flag: '/media/legacy/drapoMali.png' },
  { id: 'cote-d-ivoire', label: 'Côte d’Ivoire', flag: '/media/legacy/CI.png' },
  { id: 'brukina-faso', label: 'Burkina Faso', flag: '/media/legacy/burkina-faso.jpg' },
  { id: 'niger', label: 'Niger', flag: '/media/legacy/niger.jpg' },
] as const

const overviewCountries = [
  {
    title: 'TOGO',
    links: [
      { href: 'https://dimana.otr.tg/ETaxe/faces/authentification?_adf.ctrl-state=16erzj2ztf_3', image: '/media/legacy/img1.png', alt: 'OTR DIMANA' },
      { href: 'https://gudef.otr.tg/', image: '/media/legacy/gudef.jpg', alt: 'OTR GUDEF' },
      { href: 'https://passe.arcop.tg/publics/lite-egp', image: '/media/legacy/arcop.jpg', alt: 'ARCOP' },
      { href: 'https://services.cnss.tg/services/login', image: '/media/legacy/cnss.png', alt: 'CNSS' },
      { href: 'https://www.cfetogo.tg/portail_cfe.html', image: '/media/legacy/cfe.png', alt: 'CFE' },
      { href: 'https://dimana.otr.tg/ETaxe/faces/authentification?_adf.ctrl-state=16erzj2ztf_3', image: '/media/legacy/img1.png', alt: 'OTR DIMANA' },
      { href: 'https://www.odoo.com/fr_FR/my/databases', image: '/media/legacy/odoo.jpg', alt: 'odoo' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
    ],
  },
  {
    title: 'MALI',
    links: [
      { href: 'https://www.dgi.gouv.ml/', image: '/media/legacy/dgi_mali.jpeg', alt: 'DGI Mali' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.dgi.gouv.ml/', image: '/media/legacy/cmss.png', alt: 'cmss' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.dgi.gouv.ml/', image: '/media/legacy/dgi_mali.jpeg', alt: 'DGI Mali' },
      { href: 'https://www.odoo.com/fr_FR/my/databases', image: '/media/legacy/odoo.jpg', alt: 'odoo' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
    ],
  },
  {
    title: 'CÔTE D’IVOIRE',
    links: [
      { href: 'https://e-impots.gouv.ci/', image: '/media/legacy/e-impots.png', alt: 'DGI' },
      { href: 'https://www.services.fne.dgi.gouv.ci/fr/login', image: '/media/legacy/fne.png', alt: 'FNE' },
      { href: 'https://e.cnps.ci/', image: '/media/legacy/cnss.ci.png', alt: 'CNSS' },
      { href: 'https://e-impots.gouv.ci/', image: '/media/legacy/e-impots.png', alt: 'DGI' },
      { href: 'https://www.services.fne.dgi.gouv.ci/fr/login', image: '/media/legacy/fne.png', alt: 'FNE' },
      { href: 'https://e.cnps.ci/', image: '/media/legacy/cnss.ci.png', alt: 'CNSS' },
      { href: 'https://www.odoo.com/fr_FR/my/databases', image: '/media/legacy/odoo.jpg', alt: 'odoo' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
    ],
  },
  {
    title: 'BURKINA-FASO',
    links: [
      { href: 'https://dimana.otr.tg/ETaxe/faces/authentification?_adf.ctrl-state=16erzj2ztf_3', image: '/media/legacy/img1.png', alt: 'OTR DIMANA' },
      { href: 'https://gudef.otr.tg/', image: '/media/legacy/gudef.jpg', alt: 'OTR GUDEF' },
      { href: 'https://passe.arcop.tg/publics/lite-egp', image: '/media/legacy/arcop.jpg', alt: 'ARCOP' },
      { href: 'https://services.cnss.tg/services/login', image: '/media/legacy/cnss.png', alt: 'CNSS' },
      { href: 'https://www.cfetogo.tg/portail_cfe.html', image: '/media/legacy/cfe.png', alt: 'CFE' },
      { href: 'https://dimana.otr.tg/ETaxe/faces/authentification?_adf.ctrl-state=16erzj2ztf_3', image: '/media/legacy/img1.png', alt: 'OTR DIMANA' },
      { href: 'https://www.odoo.com/fr_FR/my/databases', image: '/media/legacy/odoo.jpg', alt: 'odoo' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
    ],
  },
  {
    title: 'NIGER',
    links: [
      { href: 'https://www.dgi.gouv.ml/', image: '/media/legacy/dgi_mali.jpeg', alt: 'DGI Mali' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.mde.ne/', image: '/media/legacy/logome.png', alt: 'mde' },
      { href: 'https://cciniger.org/', image: '/media/legacy/logoccin.jpg', alt: 'ccin' },
      { href: 'https://www.developmentaid.org/organizations/view/410648/cnpg-centre-national-de-perfectionnement-a-la-gestion', image: '/media/legacy/logodev.svg', alt: 'dev' },
      { href: 'https://www.odoo.com/fr_FR/my/databases', image: '/media/legacy/odoo.jpg', alt: 'odoo' },
      { href: 'https://niger.eregulations.org/', image: '/media/legacy/logoeregulation.png', alt: 'eregulation' },
      { href: 'http://www.cman.ne', image: '/media/legacy/cman.webp', alt: 'cman' },
      { href: 'https://www.anipex.org/', image: '/media/legacy/anipex_logo.png', alt: 'anipex' },
      { href: 'https://www.armp-niger.org/', image: '/media/legacy/armp-logo.jpg', alt: 'armp' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
      { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'GMS' },
    ],
  },
]

type ContactRow = {
  label: string
  value: string
  href?: string
}

type CountryDetail = {
  title: string
  rows: ContactRow[]
  reminders: ContactRow[]
  address: string
}

const countryDetails: Record<string, CountryDetail> = {
  togo: {
    title: 'TOGO',
    rows: [
      { label: 'Régistre de commerce', value: 'TG-LFW-01-2023-B12-00015' },
      { label: 'Immatriculation fiscale', value: '1001331977' },
      { label: 'Téléphone standard', value: '70 59 67 44' },
      { label: 'Boîte postale', value: '01BP 3903' },
      { label: 'E-mail', value: 'info@aniekgroup.com', href: 'mailto:info@aniekgroup.com' },
    ],
    reminders: [
      { label: 'Prévisions', value: 'Le 1er / mois' },
      { label: 'Préparer les salaires', value: 'Le 27 / mois' },
      { label: 'Déclaration CNSS', value: 'Le 5 / mois' },
      { label: 'Déclaration TVA OTR', value: 'Le 10 / mois' },
      { label: 'Rapprochement des écritures', value: 'Le 30 ou 31 / mois' },
    ],
    address: '42 All. des Acacias, 78250 Meulan-en-Yvelines, France | Kalkoven 291820 Melsbroek, Belgique',
  },
  mali: {
    title: 'MALI',
    rows: [
      { label: 'Numéro commercial', value: '+223 73 25 09 43' },
      { label: 'Immatriculation fiscale', value: '085152418R' },
      { label: 'E-mail', value: 'ml.keina@keinagroup.com', href: 'mailto:ml.keina@keinagroup.com' },
    ],
    reminders: [],
    address: '',
  },
  'cote-d-ivoire': {
    title: 'CÔTE D’IVOIRE',
    rows: [
      { label: 'Numéro commercial', value: '+225 07 57 71 71 11' },
      { label: 'Immatriculation fiscale', value: '2242815N' },
      { label: 'E-mail', value: 'ci.keina@keinagroup.com', href: 'mailto:ci.keina@keinagroup.com' },
    ],
    reminders: [],
    address: '',
  },
  'brukina-faso': {
    title: 'BURKINA-FASO',
    rows: [
      { label: 'Numéro commercial', value: '22 20 29 64' },
      { label: 'Immatriculation fiscale', value: '1001331977' },
      { label: 'Téléphone standard', value: '70 59 67 44' },
      { label: 'Boîte postale', value: '01BP 3903' },
      { label: 'E-mail', value: 'info@aniekgroup.com', href: 'mailto:info@aniekgroup.com' },
    ],
    reminders: [],
    address: '',
  },
  niger: {
    title: 'NIGER',
    rows: [
      { label: 'Numéro commercial', value: '22 20 29 64' },
      { label: 'Immatriculation fiscale', value: '1001331977' },
      { label: 'Téléphone standard', value: '70 59 67 44' },
      { label: 'Boîte postale', value: '01BP 3903' },
      { label: 'E-mail', value: 'info@aniekgroup.com', href: 'mailto:info@aniekgroup.com' },
    ],
    reminders: [],
    address: '',
  },
}

const mainCompanies = [
  { href: 'https://www.aniekgroup.com/', image: '/media/legacy/ANIEKGROUP.webp', alt: 'ANIEKGROUP' },
  { href: 'https://www.aptint.com/fr', image: '/media/legacy/apt.jpeg', alt: 'APT' },
  { href: 'https://kbsconstruct.com/', image: '/media/legacy/kbsc.jpg', alt: 'KBSC' },
  { href: 'https://www.keinagroup.com/', image: '/media/legacy/keinagroup.jpeg', alt: 'keinagroup' },
  { href: 'https://', image: '/media/legacy/anuba.jpg', alt: 'ANUBA' },
  { href: 'https://', image: '/media/legacy/Neyla.jpg', alt: 'Neyla' },
]

export function HomePage() {
  const { hash } = useLocation()
  const requestedCountry = hash.slice(1)
  const initialCountry = countryNav.some((country) => country.id === requestedCountry) ? requestedCountry : 'overview'
  const [activeCountry, setActiveCountry] = useState(initialCountry)

  return (
    <>
      <SiteHeader
        countryNavigation={countryNav}
        activeCountry={activeCountry}
        onCountrySelect={setActiveCountry}
      />
      <main className="public-page">
        <section className="country" style={{ display: activeCountry === 'overview' ? 'block' : 'none' }}>
          <h2>TOGO</h2>
          <div className="companies">
            {overviewCountries[0].links.map((link, index) => (
              <div className="company" key={`${link.alt}-${index}`}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  <img src={link.image} alt={link.alt} title={`Accéder au portail ${link.alt}`} />
                </a>
              </div>
            ))}
          </div>

          <h2>MALI</h2>
          <div className="companies">
            {overviewCountries[1].links.map((link, index) => (
              <div className="company" key={`${link.alt}-${index}`}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  <img src={link.image} alt={link.alt} title={`Accéder au portail ${link.alt}`} />
                </a>
              </div>
            ))}
          </div>

          <h2>CÔTE D’IVOIRE</h2>
          <div className="companies">
            {overviewCountries[2].links.map((link, index) => (
              <div className="company" key={`${link.alt}-${index}`}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  <img src={link.image} alt={link.alt} title={`Accéder au portail ${link.alt}`} />
                </a>
              </div>
            ))}
          </div>

          <h2>BURKINA-FASO</h2>
          <div className="companies">
            {overviewCountries[3].links.map((link, index) => (
              <div className="company" key={`${link.alt}-${index}`}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  <img src={link.image} alt={link.alt} title={`Accéder au portail ${link.alt}`} />
                </a>
              </div>
            ))}
          </div>

          <h2>NIGER</h2>
          <div className="companies">
            {overviewCountries[4].links.map((link, index) => (
              <div className="company" key={`${link.alt}-${index}`}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  <img src={link.image} alt={link.alt} title={`Accéder au portail ${link.alt}`} />
                </a>
              </div>
            ))}
          </div>

          <h2>ANIEK - KEINA Group - BAT Company</h2>
          <div className="services">
            {mainCompanies.map((company, index) => (
              <div className="service" key={`${company.alt}-${index}`}>
                <img src={company.image} alt={company.alt} />
              </div>
            ))}
          </div>
        </section>

        {countryNav.map((country) => {
          const detail = countryDetails[country.id as keyof typeof countryDetails]
          if (!detail) return null

          return (
            <section key={country.id} className="country" style={{ display: activeCountry === country.id ? 'block' : 'none' }}>
              <h2>{detail.title}</h2>

              <div className="companies">
                {(overviewCountries.find((entry) => entry.title === detail.title)?.links ?? []).map((link, index) => (
                  <div className="company" key={`${link.alt}-${index}`}>
                    <a href={link.href} target="_blank" rel="noreferrer">
                      <img src={link.image} alt={link.alt} title={`Accéder au portail ${link.alt}`} />
                    </a>
                  </div>
                ))}
              </div>

              <div className="country-table-grid">
                <table className="country-contact-table">
                  <tbody>
                    <tr>
                      <th colSpan={2}>Nos informations</th>
                    </tr>
                    {detail.rows.map((row) => (
                      <tr key={row.label}>
                        <td data-label={row.label}>{row.label}</td>
                        <td>
                          {row.href ? <a href={row.href}>{row.value}</a> : row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {detail.reminders.length > 0 && (
                  <table className="country-contact-table reminder-table">
                    <tbody>
                      <tr>
                        <th colSpan={2}>Rappels mensuels</th>
                      </tr>
                      {detail.reminders.map((row) => (
                        <tr key={row.label}>
                          <td data-label={row.label}>{row.label}</td>
                          <td>{row.value}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={2} className="forecast-note">
                          * Prévision : Frais administratifs pour les dossiers d'appels d'offres, fournitures (cartouches, papier et tous les indispensables).
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              {detail.address && (
                <div className="address-strip" aria-label="Adresses">
                  <strong>Adresse de livraison :</strong>
                  <span>{detail.address}</span>
                </div>
              )}
            </section>
          )
        })}

        <section className="enterprise-page">
          <h2>NOS COMPAGNIES</h2>
          <div className="services">
            {mainCompanies.map((company, index) => (
              <div className="service" key={`${company.alt}-${index}`}>
                <a href={company.href} target="_blank" rel="noreferrer">
                  <img src={company.image} alt={company.alt} />
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}