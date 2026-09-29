import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Activity, Building2, FileImage, LayoutDashboard, LogOut, Pencil, Plus, Save, Trash2, Users, X } from 'lucide-react'
import { SiteHeader } from '../components/SiteChrome'
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

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Choisissez un logo PNG, JPG, WebP ou SVG de 2 Mo maximum.')
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
    if (!name) { setError('Le nom du partenaire est obligatoire.'); return }
    if (!category) { setError('Choisissez une catégorie.'); return }
    if (data.partners.some((item) => item.id !== partner?.id && item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) { setError('Ce partenaire existe déjà.'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({ id: partner?.id ?? crypto.randomUUID(), name, category: categoryFromSlug(category.slug), categoryId: category.id, categoryName: category.name, website: String(form.get('website') ?? '').trim(), active: form.get('active') === 'on', logo }, logoFile)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  return <div className="modal-backdrop" role="presentation"><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="partner-editor-title"><header className="modal-header"><h2 id="partner-editor-title">{partner ? 'Modifier le partenaire' : 'Ajouter un partenaire'}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={19} /></button></header><form className="admin-form" onSubmit={(event) => void submit(event)}><label>Nom du partenaire<input name="name" defaultValue={partner?.name} required maxLength={150} /></label><label>Catégorie<select name="category" defaultValue={String(selectedCategoryId ?? '')} required>{categories.map((value) => <option key={value.id} value={value.id}>{value.name}</option>)}</select></label><label>Site web<input name="website" type="url" defaultValue={partner?.website} placeholder="https://" /></label><label>Logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => void handleFile(event)} /></label>{logo && <img className="logo-preview" src={logo} alt="Aperçu du logo" />}<label className="checkbox-field"><input name="active" type="checkbox" defaultChecked={partner?.active ?? true} /> Partenaire actif</label>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button className="secondary-button" type="button" onClick={onClose}>Annuler</button><button className="primary-button" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer'}</button></div></form></section></div>
}

function AdminOverview({ partnerCount, countryCount, sheetCount, latestUpload }: { partnerCount: number; countryCount: number; sheetCount: number; latestUpload: string }) {
  return <><div className="admin-heading"><div><p className="eyebrow">ESPACE DE GESTION</p><h1>Vue d’ensemble</h1><p>Activité et contenus publiés sur le portail.</p></div></div><div className="kpi-grid"><article><Users size={20} /><strong>{partnerCount}</strong><span>Partenaires actifs</span></article><article><Building2 size={20} /><strong>{countryCount}</strong><span>Filiales pays</span></article><article><FileImage size={20} /><strong>{sheetCount}</strong><span>Fiches d’équipe</span></article><article><Activity size={20} /><strong>{latestUpload}</strong><span>Dernier téléversement</span></article></div><div className="admin-quick-actions"><h2>Gestion des contenus</h2><p>Les informations modifiées ici alimentent les pages publiques et partenaires.</p></div></>
}

export function AdminPage({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const location = useLocation()
  const { data, update, apiStatus, refreshAdmin } = useAppData()
  const [editor, setEditor] = useState<Partner | null | undefined>(undefined)
  const [notice, setNotice] = useState('')
  const activeView = (location.pathname.split('/').filter(Boolean)[1] as AdminView | undefined) ?? 'dashboard'
  const activePartners = useMemo(() => data.partners.filter((partner) => partner.active).length, [data.partners])

  useEffect(() => {
    if (!apiBaseUrl || apiStatus.state === 'demo') return
    void refreshAdmin().catch((reason: unknown) => setNotice(reason instanceof Error ? reason.message : 'Chargement admin impossible.'))
  }, [apiStatus.state, refreshAdmin])

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

  async function deletePartner(partner: Partner) {
    if (!window.confirm(`Supprimer le partenaire « ${partner.name} » ?`)) return
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

  return <><SiteHeader /><div className="admin-shell"><aside className="admin-sidebar"><div className="admin-identity"><span className="admin-avatar">{email.slice(0, 1).toUpperCase()}</span><span><strong>Administrateur</strong><small>{email}</small></span></div><nav aria-label="Administration">{views.map(({ id, label, icon: Icon }) => <NavLink key={id} to={id === 'dashboard' ? '/admin' : `/admin/${id}`} end={id === 'dashboard'} className={({ isActive }) => isActive ? 'admin-nav-link is-active' : 'admin-nav-link'}><Icon size={18} />{label}</NavLink>)}</nav></aside><main className="admin-content"><div className="admin-topbar"><div className="admin-page-kind"><p className="eyebrow">ADMINISTRATION</p><h1>Espace gestion</h1></div><button className="secondary-button signout-button" type="button" onClick={() => void onSignOut()}><LogOut size={17} /> Déconnexion</button></div>{notice && <div className="notice-bar" role="status">{notice}<button type="button" className="icon-button" aria-label="Fermer le message" onClick={() => setNotice('')}><X size={16} /></button></div>}
    {activeView === 'dashboard' && <AdminOverview partnerCount={activePartners} countryCount={data.countries.length} sheetCount={data.teamSheets.length} latestUpload={data.activity.find((entry) => entry.action === 'Remplacement de fiche') ? new Date(data.activity.find((entry) => entry.action === 'Remplacement de fiche')!.date).toLocaleDateString('fr-FR') : '—'} />}
    {activeView === 'partners' && <><div className="admin-heading"><div><p className="eyebrow">CATALOGUE</p><h1>Partenaires</h1><p>{data.partners.length} entrées · {activePartners} actives</p></div><button className="primary-button" type="button" onClick={() => setEditor(null)}><Plus size={17} /> Nouveau partenaire</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Partenaire</th><th>Catégorie</th><th>Statut</th><th>Site web</th><th>Actions</th></tr></thead><tbody>{data.partners.map((partner) => <tr key={partner.id}><td><span className="table-partner"><img src={partner.logo} alt="" />{partner.name}</span></td><td>{partner.categoryName ?? categoryLabels[partner.category]}</td><td><span className={partner.active ? 'status-badge is-active' : 'status-badge'}>{partner.active ? 'Actif' : 'Inactif'}</span></td><td>{partner.website ? <a href={partner.website} target="_blank" rel="noreferrer">Ouvrir</a> : '—'}</td><td><div className="row-actions"><button className="icon-button" type="button" onClick={() => setEditor(partner)} aria-label={`Modifier ${partner.name}`}><Pencil size={16} /></button><button className="icon-button danger-button" type="button" onClick={() => void deletePartner(partner)} aria-label={`Supprimer ${partner.name}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></>}
    {activeView === 'countries' && <><div className="admin-heading"><div><p className="eyebrow">COORDONNÉES PUBLIQUES</p><h1>Filiales pays</h1><p>Les modifications sont répercutées sur le site vitrine.</p></div></div><div className="country-admin-list">{data.countries.map((country) => <CountryEditor key={country.id} country={country} onSave={saveCountry} />)}</div></>}
    {activeView === 'team' && <><div className="admin-heading"><div><p className="eyebrow">DOCUMENTS & MÉDIAS</p><h1>Fiches d’équipe</h1><p>Remplacez une fiche sans modifier son ordre dans la galerie.</p></div></div><div className="team-admin-grid">{data.teamSheets.map((sheet) => <article className="team-admin-item" key={sheet.id}><img src={sheet.image} alt={sheet.title} /><div><strong>{sheet.title}</strong><label className="upload-button"><FileImage size={16} /> Remplacer<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadSheet(sheet, event.target.files?.[0])} /></label></div></article>)}</div></>}
    {activeView === 'activity' && <><div className="admin-heading"><div><p className="eyebrow">TRAÇABILITÉ</p><h1>Journal d’activité</h1><p>Historique des changements effectués depuis cette interface.</p></div></div><div className="activity-list">{data.activity.length ? data.activity.map((entry) => <article key={entry.id}><span className="activity-dot" /><div><strong>{entry.action}</strong><p>{entry.target}</p></div><time>{new Date(entry.date).toLocaleString('fr-FR')}</time></article>) : <p className="empty-state">Aucune activité enregistrée.</p>}</div></>}
    <p className="admin-storage-note">{apiBaseUrl ? 'Les modifications sont enregistrées sur le serveur ANIEK et partagées entre les navigateurs.' : 'Mode aperçu local : les modifications restent dans ce navigateur. Pour les partager avec les autres navigateurs, le serveur Laravel et sa base de données doivent être démarrés.'}</p>
  </main></div>{editor !== undefined && <PartnerEditor partner={editor} onSave={savePartner} onClose={() => setEditor(undefined)} />}</>
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