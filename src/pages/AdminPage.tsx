import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Activity, ArrowUpRight, Building2, CheckCircle2, Clock3, FileImage, LayoutDashboard, LogOut, Pencil, Plus, Save, Search, Trash2, Users, X } from 'lucide-react'
import { SiteHeader } from '../components/SiteChrome'
import { AdminConfirmDialog } from '../components/admin/AdminConfirmDialog'
import './AdminPage.css'
import { categoryFromSlug, categoryLabels } from '../data/initialData'
import { deletePartner as deletePartnerApi, replaceTeamSheetImage, saveCountry as saveCountryApi, savePartner as savePartnerApi } from '../services/adminApi'
import { apiBaseUrl } from '../services/apiClient'
import { useAppData } from '../services/dataStore'
import type { ActivityEntry, Country, Partner, PartnerCategory, TeamSheet } from '../types/domain'

type AdminView = 'dashboard' | 'partners' | 'countries' | 'team' | 'activity'

const views: Array<{ id: AdminView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'partners', label: 'Partenaires', icon: Users },
  { id: 'countries', label: 'Filiales', icon: Building2 },
  { id: 'team', label: 'Fiches d’équipe', icon: FileImage },
  { id: 'activity', label: 'Journal d’activité', icon: Activity },
]

function makeActivity(action: string, target: string): ActivityEntry {
  return { id: crypto.randomUUID(), action, target, date: new Date().toISOString() }
}

function fileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Fichier illisible.'))
    reader.onerror = () => reject(new Error('Impossible de lire le fichier.'))
    reader.readAsDataURL(file)
  })
}

function PartnerEditor({ partner, onSave, onClose }: { partner: Partner | null; onSave: (partner: Partner, logo?: File) => Promise<void>; onClose: () => void }) {
  const { data } = useAppData()
  const [error, setError] = useState('')
  const [logo, setLogo] = useState(partner?.logo ?? '')
  const [logoFile, setLogoFile] = useState<File>()
  const [saving, setSaving] = useState(false)
  const categories = data.categories.length ? data.categories : (Object.entries(categoryLabels) as Array<[PartnerCategory, string]>).map(([slug, name], index) => ({ id: index + 1, slug, name }))
  const selectedCategoryId = partner?.categoryId ?? categories.find((item) => categoryFromSlug(item.slug) === partner?.category)?.id ?? categories[0]?.id
  const countryCodes: Record<string, string> = { togo: 'TG', mali: 'ML', 'cote-d-ivoire': 'CI', 'burkina-faso': 'BF', niger: 'NE' }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const validExtensions = /\.(png|jpe?g|webp|svg)$/i
    const isImageMime = file.type.startsWith('image/') || file.type === ''
    if ((!isImageMime && !validExtensions.test(file.name)) || (!validExtensions.test(file.name) && !['image/png', 'image/jpeg', 'image/jpg', 'image/pjpeg', 'image/webp', 'image/svg+xml'].includes(file.type.toLowerCase()))) {
      setError('Choisissez une photo ou un logo au format PNG, JPG, WebP ou SVG.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La taille de la photo ne peut pas excéder 5 Mo.')
      return
    }
    try {
      setLogo(await fileAsDataUrl(file))
      setLogoFile(file)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Impossible de lire le fichier.')
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const category = categories.find((item) => item.id === Number(form.get('category')))
    const selectedCountries = form.getAll('countryCodes').map(String)
    if (!name) { setError('Le nom du partenaire est obligatoire.'); return }
    if (!category) { setError('Choisissez une catégorie.'); return }
    if (!partner && !logoFile) { setError('Ajoutez un logo ou une photo pour créer le partenaire.'); return }
    if (data.partners.some((item) => item.id !== partner?.id && item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) { setError('Ce partenaire existe déjà.'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({
        id: partner?.id ?? crypto.randomUUID(),
        name,
        category: categoryFromSlug(category.slug),
        categoryId: category.id,
        categoryName: category.name,
        description: String(form.get('description') ?? '').trim(),
        website: String(form.get('website') ?? '').trim(),
        active: form.get('active') === 'on',
        featured: form.get('featured') === 'on',
        countryCodes: selectedCountries,
        logo,
      }, logoFile)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="partner-editor-title">
        <header className="modal-header"><h2 id="partner-editor-title">{partner ? 'Modifier le partenaire' : 'Ajouter le partenaire'}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={19} /></button></header>
        <form className="admin-form" onSubmit={(event) => void submit(event)}>
          <label>Nom du partenaire<input name="name" defaultValue={partner?.name} required maxLength={150} /></label>
          <label>Catégorie<select name="category" defaultValue={String(selectedCategoryId ?? '')} required>{categories.map((value) => <option key={value.id} value={value.id}>{value.name}</option>)}</select></label>
          <label>Description<textarea name="description" defaultValue={partner?.description} rows={3} maxLength={2000} placeholder="Présentez l’expertise de ce partenaire." /></label>
          <label>Site web<input name="website" type="url" defaultValue={partner?.website} placeholder="https://" /></label>
          <fieldset className="partner-country-options"><legend>Pays de couverture</legend><div>{data.countries.map((country) => { const code = country.isoCode ?? countryCodes[country.id] ?? country.id.toUpperCase(); return <label key={country.id}><input type="checkbox" name="countryCodes" value={code} defaultChecked={partner?.countryCodes?.includes(code)} />{country.name}</label> })}</div></fieldset>
          <label>Logo / Photo<input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg,image/*" required={!partner} onChange={(event) => void handleFile(event)} /></label>
          {logo && <img className="logo-preview" src={logo} alt="Aperçu du logo" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.5' }} />}
          <div className="partner-status-options"><label className="checkbox-field"><input name="active" type="checkbox" defaultChecked={partner?.active ?? true} /> Partenaire actif</label><label className="checkbox-field"><input name="featured" type="checkbox" defaultChecked={partner?.featured ?? false} /> Mettre en avant</label></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions"><button className="secondary-button" type="button" onClick={onClose}>Annuler</button><button className="primary-button" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
        </form>
      </section>
    </div>
  )
}

function AdminOverview({ partnerCount, partnerTotal, countryCount, sheetCount, latestUpload, recentActivity, isConnected }: { partnerCount: number; partnerTotal: number; countryCount: number; sheetCount: number; latestUpload: string; recentActivity: ActivityEntry[]; isConnected: boolean }) {
  const shortcuts = [
    { href: '/admin/partners', label: 'Gérer les partenaires', description: 'Catalogues, logos et visibilité', icon: Users },
    { href: '/admin/countries', label: 'Filiales pays', description: 'Coordonnées des implantations', icon: Building2 },
    { href: '/admin/team', label: 'Fiches d’équipe', description: 'Documents et organigrammes', icon: FileImage },
  ]

  return (
    <div className="admin-overview">
      <header className="overview-intro">
        <div><p className="eyebrow">PILOTAGE DU PORTAIL</p><h1>Vue d’ensemble</h1><p>Suivez les contenus publiés et accédez directement aux principales actions de gestion.</p></div>
        <div className="overview-header-actions"><div className={`overview-connection ${isConnected ? 'is-connected' : 'is-disconnected'}`}><span className="overview-connection-dot" />{isConnected ? 'Données synchronisées' : 'Synchronisation à vérifier'}</div></div>
      </header>

      <section className="overview-metrics" aria-label="Indicateurs du portail">
        <article><span className="overview-metric-icon"><Users size={18} /></span><div><strong>{partnerCount}</strong><span>Partenaires actifs</span><small>{partnerTotal} référencés au total</small></div></article>
        <article><span className="overview-metric-icon"><Building2 size={18} /></span><div><strong>{countryCount}</strong><span>Implantations</span><small>Filiales pays suivies</small></div></article>
        <article><span className="overview-metric-icon"><FileImage size={18} /></span><div><strong>{sheetCount}</strong><span>Fiches d’équipe</span><small>Documents publiés</small></div></article>
        <article><span className="overview-metric-icon"><Clock3 size={18} /></span><div><strong className="overview-metric-date">{latestUpload}</strong><span>Dernière mise à jour</span><small>Remplacement d’une fiche</small></div></article>
      </section>

      <div className="overview-lower-grid">
        <section className="overview-shortcuts" aria-labelledby="overview-shortcuts-title">
          <div className="overview-section-heading"><div><p className="eyebrow">GESTION</p><h2 id="overview-shortcuts-title">Accès rapides</h2></div><span>01 — 03</span></div>
          <nav aria-label="Accès rapides à la gestion">{shortcuts.map(({ href, label, description, icon: Icon }, index) => <Link key={href} to={href}><span className="overview-shortcut-index">0{index + 1}</span><Icon size={19} /><span className="overview-shortcut-copy"><strong>{label}</strong><small>{description}</small></span><ArrowUpRight size={17} className="overview-shortcut-arrow" /></Link>)}</nav>
        </section>

        <section className="overview-activity" aria-labelledby="overview-activity-title">
          <div className="overview-section-heading"><div><p className="eyebrow">TRAÇABILITÉ</p><h2 id="overview-activity-title">Activité récente</h2></div><Link to="/admin/activity">Tout voir <ArrowUpRight size={14} /></Link></div>
          {recentActivity.length ? <ol>{recentActivity.map((entry) => <li key={entry.id}><span className="overview-activity-mark"><CheckCircle2 size={15} /></span><div><strong>{entry.action}</strong><span>{entry.target}</span></div><time dateTime={entry.date}>{new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</time></li>)}</ol> : <div className="overview-empty-activity"><Activity size={18} /><p>Aucune modification récente.</p><span>Les prochaines actions publiées apparaîtront ici.</span></div>}
        </section>
      </div>
    </div>
  )
}

export function AdminPage({ email, onLogout }: { email: string; onLogout: () => Promise<void> }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { data, update, apiStatus, refreshAdmin } = useAppData()
  const [editor, setEditor] = useState<Partner | null | undefined>(undefined)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)
  const [notice, setNotice] = useState('')
  const [partnerQuery, setPartnerQuery] = useState('')
  const activeView = (location.pathname.split('/').filter(Boolean)[1] as AdminView | undefined) ?? 'dashboard'
  const activePartners = useMemo(() => data.partners.filter((partner) => partner.active).length, [data.partners])
  const visiblePartners = useMemo(() => {
    const query = partnerQuery.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr')
    return data.partners.filter((partner) => `${partner.name} ${partner.categoryName ?? categoryLabels[partner.category]} ${partner.description ?? ''}`
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').includes(query))
  }, [data.partners, partnerQuery])

  async function handleLogout() {
    try {
      await onLogout()
    } catch {
      setNotice('La session locale est fermée, mais la révocation sur le serveur a échoué.')
    } finally {
      navigate('/admin/login', { replace: true })
    }
  }

  useEffect(() => {
    if (!apiBaseUrl) return
    void refreshAdmin().catch((reason: unknown) => setNotice(reason instanceof Error ? reason.message : 'Chargement admin impossible.'))
  }, [refreshAdmin])

  async function savePartner(partner: Partner, logo?: File) {
    const exists = data.partners.some((item) => item.id === partner.id)
    if (apiBaseUrl) {
      await savePartnerApi(partner, logo)
      await refreshAdmin()
    } else {
      update({ ...data, partners: exists ? data.partners.map((item) => item.id === partner.id ? partner : item) : [partner, ...data.partners], activity: [makeActivity(exists ? 'Modification' : 'Création', partner.name), ...data.activity].slice(0, 100) })
    }
    setEditor(undefined)
    setNotice(`${partner.name} a été enregistré.`)
  }

  function deletePartner(partner: Partner) {
    setPartnerToDelete(partner)
  }

  async function confirmPartnerDeletion() {
    if (!partnerToDelete) return
    const partner = partnerToDelete
    setPartnerToDelete(null)
    try {
      if (apiBaseUrl) {
        await deletePartnerApi(partner.id)
        await refreshAdmin()
      } else {
        update({ ...data, partners: data.partners.filter((item) => item.id !== partner.id), activity: [makeActivity('Suppression', partner.name), ...data.activity].slice(0, 100) })
      }
      setNotice(`${partner.name} a été supprimé.`)
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : 'Suppression impossible.')
    }
  }

  async function saveCountry(country: Country) {
    if (apiBaseUrl) {
      await saveCountryApi(country)
      await refreshAdmin()
    } else {
      update({ ...data, countries: data.countries.map((item) => item.id === country.id ? country : item), activity: [makeActivity('Mise à jour des coordonnées', country.name), ...data.activity].slice(0, 100) })
    }
    setNotice(`Les coordonnées de ${country.name} ont été enregistrées.`)
  }

  async function uploadSheet(sheet: TeamSheet, file?: File) {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setNotice('Format invalide : utilisez PNG, JPG ou WebP (5 Mo maximum).'); return }
    try {
      if (apiBaseUrl) {
        await replaceTeamSheetImage(sheet, file)
        await refreshAdmin()
        setNotice(`${sheet.title} a été remplacée.`)
        return
      }
      const image = await fileAsDataUrl(file)
      update({ ...data, teamSheets: data.teamSheets.map((item) => item.id === sheet.id ? { ...item, image } : item), activity: [makeActivity('Remplacement de fiche', sheet.title), ...data.activity].slice(0, 100) })
      setNotice(`${sheet.title} a été remplacée.`)
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : 'Impossible de lire le fichier.')
    }
  }

  return <><SiteHeader /><div className="admin-shell"><aside className="admin-sidebar"><div className="admin-identity"><span className="admin-avatar">{email.slice(0, 1).toUpperCase()}</span><span><strong>Accès réservé</strong><small>{email}</small></span></div><nav aria-label="Accès réservé">{views.map(({ id, label, icon: Icon }) => <NavLink key={id} to={id === 'dashboard' ? '/admin' : `/admin/${id}`} end={id === 'dashboard'} className={({ isActive }) => isActive ? 'admin-nav-link is-active' : 'admin-nav-link'}><Icon size={18} />{label}</NavLink>)}</nav><div className="admin-sidebar-footer"><button className="admin-signout" type="button" onClick={() => void handleLogout()}><LogOut size={16} />Déconnexion</button></div></aside><main className="admin-content">{notice && <div className="notice-bar" role="status">{notice}<button type="button" className="icon-button" aria-label="Fermer le message" onClick={() => setNotice('')}><X size={16} /></button></div>}
    {activeView === 'dashboard' && <AdminOverview partnerCount={activePartners} partnerTotal={data.partners.length} countryCount={data.countries.length} sheetCount={data.teamSheets.length} latestUpload={data.activity.find((entry) => entry.action === 'Remplacement de fiche') ? new Date(data.activity.find((entry) => entry.action === 'Remplacement de fiche')!.date).toLocaleDateString('fr-FR') : '—'} recentActivity={data.activity.slice(0, 4)} isConnected={apiStatus.state === 'connected'} />}
    {activeView === 'partners' && <>
      <div className="admin-heading"><div><p className="eyebrow">CATALOGUE</p><h1>Partenaires</h1><p>{data.partners.length} entrées · {activePartners} actives</p></div><button className="primary-button" type="button" onClick={() => setEditor(null)}><Plus size={17} /> Nouveau partenaire</button></div>
      <div className="admin-table-toolbar"><label className="search-field"><Search size={17} aria-hidden="true" /><input type="search" value={partnerQuery} onChange={(event) => setPartnerQuery(event.target.value)} placeholder="Rechercher un partenaire, une catégorie…" aria-label="Rechercher dans les partenaires" /></label><span>{visiblePartners.length} résultat{visiblePartners.length === 1 ? '' : 's'}</span></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Partenaire</th><th>Catégorie</th><th>Pays</th><th>Statut</th><th>Site web</th><th>Actions</th></tr></thead><tbody>{visiblePartners.map((partner) => <tr key={partner.id}><td><span className="table-partner"><img src={partner.logo} alt="" onError={(e) => { const el = e.currentTarget; if (!el.dataset.fallback) { el.dataset.fallback = '1'; el.src = '/media/partners/logo.svg' } }} /><span><strong>{partner.name}</strong>{partner.description && <small>{partner.description}</small>}</span></span></td><td>{partner.categoryName ?? categoryLabels[partner.category]}</td><td>{partner.countryCodes?.map((code) => data.countries.find((country) => country.isoCode === code)?.name ?? code).join(', ') || '—'}</td><td><span className={partner.active ? 'status-badge is-active' : 'status-badge'}>{partner.active ? 'Actif' : 'Inactif'}</span>{partner.featured && <span className="status-badge is-featured">En avant</span>}</td><td>{partner.website ? <a href={partner.website} target="_blank" rel="noreferrer">Ouvrir</a> : '—'}</td><td><div className="row-actions"><button className="icon-button" type="button" onClick={() => setEditor(partner)} aria-label={`Modifier ${partner.name}`}><Pencil size={16} /></button><button className="icon-button danger-button" type="button" onClick={() => void deletePartner(partner)} aria-label={`Supprimer ${partner.name}`}><Trash2 size={16} /></button></div></td></tr>)}{visiblePartners.length === 0 && <tr><td colSpan={6}><p className="empty-state">Aucun partenaire ne correspond à cette recherche.</p></td></tr>}</tbody></table></div>
    </>}
    {activeView === 'countries' && <><div className="admin-heading"><div><p className="eyebrow">COORDONNÉES PUBLIQUES</p><h1>Filiales pays</h1><p>Les modifications sont répercutées sur le site vitrine.</p></div></div><div className="country-admin-list">{data.countries.map((country) => <CountryEditor key={country.id} country={country} onSave={saveCountry} />)}</div></>}
    {activeView === 'team' && <><div className="admin-heading"><div><p className="eyebrow">DOCUMENTS & MÉDIAS</p><h1>Fiches d’équipe</h1><p>Remplacez une fiche sans modifier son ordre dans la galerie.</p></div></div><div className="team-admin-grid">{data.teamSheets.map((sheet) => <article className="team-admin-item" key={sheet.id}><img src={sheet.image} alt={sheet.title} /><div><strong>{sheet.title}</strong><label className="upload-button"><FileImage size={16} /> Remplacer<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadSheet(sheet, event.target.files?.[0])} /></label></div></article>)}</div></>}
    {activeView === 'activity' && <><div className="admin-heading"><div><p className="eyebrow">TRAÇABILITÉ</p><h1>Journal d’activité</h1><p>Historique des changements effectués depuis cette interface.</p></div></div><div className="activity-list">{data.activity.length ? data.activity.map((entry) => <article key={entry.id}><span className="activity-dot" /><div><strong>{entry.action}</strong><p>{entry.target}</p></div><time>{new Date(entry.date).toLocaleString('fr-FR')}</time></article>) : <p className="empty-state">Aucune activité enregistrée.</p>}</div></>}
    <p className="admin-storage-note">{apiBaseUrl ? 'Les modifications sont enregistrées sur le serveur ANIEK et partagées entre les navigateurs.' : 'Mode aperçu local : les modifications restent dans ce navigateur. Pour les partager avec les autres navigateurs, le serveur Laravel et sa base de données doivent être démarrés.'}</p>
  </main></div>{editor !== undefined && <PartnerEditor partner={editor} onSave={savePartner} onClose={() => setEditor(undefined)} />}
    {partnerToDelete && <AdminConfirmDialog itemName={partnerToDelete.name} description="Ce partenaire sera supprimé du catalogue." onCancel={() => setPartnerToDelete(null)} onConfirm={() => void confirmPartnerDeletion()} />}
  </>
}

function CountryEditor({ country, onSave }: { country: Country; onSave: (country: Country) => Promise<void> }) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      await onSave({
        ...country,
        registration: String(form.get('registration') ?? ''),
        taxNumber: String(form.get('taxNumber') ?? ''),
        agencyName: String(form.get('agencyName') ?? ''),
        address: String(form.get('address') ?? ''),
        city: String(form.get('city') ?? ''),
        postalCode: String(form.get('postalCode') ?? ''),
        phone: String(form.get('phone') ?? ''),
        phoneEmergency: String(form.get('phoneEmergency') ?? ''),
        email: String(form.get('email') ?? ''),
        emailSecondary: String(form.get('emailSecondary') ?? ''),
        director: String(form.get('director') ?? ''),
        directorTitle: String(form.get('directorTitle') ?? ''),
        currency: String(form.get('currency') ?? country.currency ?? 'Franc CFA (XOF)'),
        openingHours: String(form.get('openingHours') ?? ''),
      })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }
  return <form className="country-editor" onSubmit={(event) => void submit(event)}>
    <div className="country-editor-title"><img src={`/media/flags/${country.flag}`} alt="" /><h2>{country.name}</h2></div>
    <div className="country-form-grid">
      <label>Agence<input name="agencyName" defaultValue={country.agencyName} /></label>
      <label>Adresse<input name="address" defaultValue={country.address} /></label>
      <label>Ville<input name="city" defaultValue={country.city} /></label>
      <label>Code postal<input name="postalCode" defaultValue={country.postalCode} /></label>
      <label>Téléphone<input name="phone" defaultValue={country.phone} /></label>
      <label>Téléphone d’urgence<input name="phoneEmergency" defaultValue={country.phoneEmergency} /></label>
      <label>E-mail<input name="email" type="email" defaultValue={country.email} /></label>
      <label>E-mail secondaire<input name="emailSecondary" type="email" defaultValue={country.emailSecondary} /></label>
      <label>Responsable<input name="director" defaultValue={country.director} /></label>
      <label>Fonction<input name="directorTitle" defaultValue={country.directorTitle} /></label>
      <label>Devise<input name="currency" defaultValue={country.currency} /></label>
      <label>Horaires<input name="openingHours" defaultValue={country.openingHours} /></label>
      {!apiBaseUrl && <>
        <label>Registre<input name="registration" defaultValue={country.registration} /></label>
        <label>Immatriculation fiscale<input name="taxNumber" defaultValue={country.taxNumber} /></label>
      </>}
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="secondary-button" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer les coordonnées'}</button>
  </form>
}