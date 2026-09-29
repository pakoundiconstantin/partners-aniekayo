import { useDeferredValue, useState } from 'react'
import { ExternalLink, LogOut, Search } from 'lucide-react'
import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import { TeamViewer } from '../components/TeamViewer'
import { categoryLabels } from '../data/initialData'
import { useAppData } from '../services/dataStore'
import type { PartnerCategory } from '../types/domain'

const categories: Array<'all' | PartnerCategory> = ['all', 'automobile', 'industrie', 'outillage', 'informatique', 'logistique', 'autre']
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr')

export function PartnersPage({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const { data } = useAppData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | PartnerCategory>('all')
  const [viewerOpen, setViewerOpen] = useState(false)
  const deferredQuery = useDeferredValue(normalize(query.trim()))
  const partners = data.partners.filter((partner) => partner.active && (category === 'all' || partner.category === category) && normalize(`${partner.name} ${categoryLabels[partner.category]}`).includes(deferredQuery))

  return <><SiteHeader partnerArea /><main className="partners-page"><section className="page-title-row"><div><p className="eyebrow">ANIEK GROUP SERVICES</p><h1>Nos partenaires privés</h1><p>Marques et équipementiers de notre réseau international.</p></div><button className="secondary-button signout-button" type="button" onClick={() => void onSignOut()}><LogOut size={17} /> Déconnexion</button></section><section className="partner-toolbar" aria-label="Recherche et filtres"><label className="search-field"><Search size={18} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une marque ou une catégorie" /></label><div className="category-filters">{categories.map((item) => <button type="button" key={item} className={category === item ? 'filter-chip is-active' : 'filter-chip'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === 'all' ? 'Tous' : categoryLabels[item]}</button>)}</div></section><div className="results-caption">{partners.length} partenaire{partners.length === 1 ? '' : 's'}</div>{partners.length ? <div className="partner-grid">{partners.map((partner) => <a className="partner-card" key={partner.id} href={partner.website || undefined} target={partner.website ? '_blank' : undefined} rel="noreferrer" aria-label={`${partner.name}, ${categoryLabels[partner.category]}`}><div className="partner-logo"><img src={partner.logo} alt={partner.name} loading="lazy" /></div><div className="partner-card-caption"><span><strong>{partner.name}</strong><small>{categoryLabels[partner.category]}</small></span>{partner.website && <ExternalLink size={16} />}</div></a>)}</div> : <p className="empty-state">Aucun partenaire ne correspond à votre recherche.</p>}<section className="team-teaser"><div><p className="eyebrow">COMPÉTENCES & ORGANISATION</p><h2>Découvrez les équipes du groupe</h2></div><button className="primary-button" type="button" onClick={() => setViewerOpen(true)}>Voir les 11 fiches</button></section></main><SiteFooter onTeamClick={() => setViewerOpen(true)} />{viewerOpen && <TeamViewer onClose={() => setViewerOpen(false)} />}</>
}