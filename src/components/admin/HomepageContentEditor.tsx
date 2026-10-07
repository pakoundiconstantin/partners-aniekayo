import { useEffect, useState } from 'react'
import { Check, Eye, LoaderCircle, Plus, Save, Trash2 } from 'lucide-react'
import { homepageContentStorageKey, initialHomepageContent } from '../../data/homepageDefaults'
import type { ExpertiseIcon, HomepageContent } from '../../types/domain'
import { apiBaseUrl } from '../../services/apiClient'
import { getHomepageContent, saveHomepageContent } from '../../services/adminApi'
import './HomepageContentEditor.css'

const iconOptions: Array<{ value: ExpertiseIcon; label: string }> = [
  { value: 'Factory', label: 'Industrie' },
  { value: 'HardHat', label: 'BTP' },
  { value: 'Wrench', label: 'Maintenance' },
  { value: 'Building2', label: 'Services' },
]

export function HomepageContentEditor({ onSaved }: { onSaved: (message: string) => void }) {
  const [content, setContent] = useState<HomepageContent>(initialHomepageContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const stored = apiBaseUrl
          ? await getHomepageContent()
          : JSON.parse(localStorage.getItem(homepageContentStorageKey) ?? 'null') as HomepageContent | null
        if (active && stored) setContent(stored)
      } catch (reason) {
        if (active) {
          setLoadFailed(true)
          setError(reason instanceof Error ? reason.message : 'Impossible de charger le contenu du site.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => { active = false }
  }, [])

  function updateSection<K extends keyof HomepageContent>(section: K, field: keyof HomepageContent[K], value: string) {
    setContent((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }))
  }

  function updateExpertise(index: number, field: 'title' | 'description' | 'icon', value: string) {
    setContent((current) => ({
      ...current,
      expertise: {
        ...current.expertise,
        items: current.expertise.items.map((item, itemIndex) => itemIndex === index
          ? { ...item, [field]: value }
          : item),
      },
    }))
  }

  function updateCompany(index: number, field: 'name' | 'image' | 'href', value: string) {
    setContent((current) => ({
      ...current,
      companies: {
        ...current.companies,
        items: current.companies.items.map((item, itemIndex) => itemIndex === index
          ? { ...item, [field]: value }
          : item),
      },
    }))
  }

  async function publish() {
    setSaving(true)
    setError('')
    try {
      if (apiBaseUrl) {
        const saved = await saveHomepageContent(content)
        setContent(saved)
      } else {
        localStorage.setItem(homepageContentStorageKey, JSON.stringify(content))
      }
      onSaved('Le contenu du site vitrine a été publié.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'La publication a échoué.')
    } finally {
      setSaving(false)
    }
  }

  function addExpertise() {
    if (content.expertise.items.length >= 8) return
    setContent((current) => ({
      ...current,
      expertise: {
        ...current.expertise,
        items: [...current.expertise.items, { title: '', description: '', icon: 'Building2' }],
      },
    }))
  }

  function removeExpertise(index: number) {
    setContent((current) => ({
      ...current,
      expertise: { ...current.expertise, items: current.expertise.items.filter((_, itemIndex) => itemIndex !== index) },
    }))
  }

  function addCompany() {
    if (content.companies.items.length >= 12) return
    setContent((current) => ({
      ...current,
      companies: { ...current.companies, items: [...current.companies.items, { name: '', image: '', href: '' }] },
    }))
  }

  function removeCompany(index: number) {
    setContent((current) => ({
      ...current,
      companies: { ...current.companies, items: current.companies.items.filter((_, itemIndex) => itemIndex !== index) },
    }))
  }

  if (loading) return <div className="homepage-editor-loading"><LoaderCircle size={18} /> Chargement du contenu…</div>

  return (
    <div className="homepage-editor">
      <header className="admin-heading homepage-editor-heading">
        <div><p className="eyebrow">PUBLICATION DU SITE</p><h1>Site vitrine</h1><p>Modifiez les contenus visibles sur l’accueil, sans toucher aux coordonnées des filiales.</p></div>
        <button className="primary-button" type="button" onClick={() => void publish()} disabled={saving || loadFailed}>
          {saving ? <LoaderCircle size={17} className="is-spinning" /> : <Save size={17} />}
          {saving ? 'Publication…' : loadFailed ? 'Contenu indisponible' : 'Publier les modifications'}
        </button>
      </header>

      <div className="homepage-editor-meta"><span><Check size={15} /> {apiBaseUrl ? 'Publication partagée sur le site' : 'Mode aperçu local · visible dans ce navigateur'}</span><a href="/" target="_blank" rel="noreferrer"><Eye size={15} /> Prévisualiser le site</a></div>

      <section className="homepage-editor-section" aria-labelledby="home-hero-editor-title">
        <div className="homepage-editor-section-heading"><div><p className="eyebrow">01 · PREMIÈRE IMPRESSION</p><h2 id="home-hero-editor-title">Bannière principale</h2><p>Le message et le visuel affichés dès l’arrivée sur le site.</p></div><span className="homepage-section-index">01</span></div>
        <div className="homepage-editor-grid">
          <label className="homepage-field homepage-field--wide">Accroche<input maxLength={120} value={content.hero.eyebrow} onChange={(event) => updateSection('hero', 'eyebrow', event.target.value)} /></label>
          <label className="homepage-field">Titre principal<input maxLength={120} value={content.hero.title} onChange={(event) => updateSection('hero', 'title', event.target.value)} /></label>
          <label className="homepage-field">Mise en valeur<input maxLength={100} value={content.hero.highlight} onChange={(event) => updateSection('hero', 'highlight', event.target.value)} /></label>
          <label className="homepage-field homepage-field--wide">Texte de présentation<textarea rows={3} maxLength={500} value={content.hero.description} onChange={(event) => updateSection('hero', 'description', event.target.value)} /><small>{content.hero.description.length}/500 caractères</small></label>
          <label className="homepage-field homepage-field--wide">Chemin du visuel<input maxLength={255} value={content.hero.image} onChange={(event) => updateSection('hero', 'image', event.target.value)} placeholder="/media/home/visuel.jpg" /><small>Utilisez un fichier déjà présent dans les médias du site.</small></label>
        </div>
        <div className="homepage-hero-preview"><img src={content.hero.image} alt="Aperçu de la bannière principale" /><div><span>{content.hero.eyebrow || 'ACCROCHE'}</span><strong>{content.hero.title} <em>{content.hero.highlight}</em></strong><p>{content.hero.description}</p></div></div>
      </section>

      <section className="homepage-editor-section" aria-labelledby="home-expertise-editor-title">
        <div className="homepage-editor-section-heading"><div><p className="eyebrow">02 · SAVOIR-FAIRE</p><h2 id="home-expertise-editor-title">Métiers et expertises</h2><p>Les cartes qui présentent les activités du groupe.</p></div><button className="secondary-button" type="button" onClick={addExpertise} disabled={content.expertise.items.length >= 8}><Plus size={16} /> Ajouter un métier</button></div>
        <div className="homepage-editor-grid">
          <label className="homepage-field">Surtitre<input maxLength={120} value={content.expertise.eyebrow} onChange={(event) => updateSection('expertise', 'eyebrow', event.target.value)} /></label>
          <label className="homepage-field">Titre de section<input maxLength={150} value={content.expertise.title} onChange={(event) => updateSection('expertise', 'title', event.target.value)} /></label>
          <label className="homepage-field homepage-field--wide">Introduction<textarea rows={2} maxLength={300} value={content.expertise.description} onChange={(event) => updateSection('expertise', 'description', event.target.value)} /></label>
        </div>
        <div className="homepage-editor-list">{content.expertise.items.map((item, index) => <article className="homepage-edit-row" key={`expertise-${index}`}><span className="homepage-edit-number">{String(index + 1).padStart(2, '0')}</span><label className="homepage-field">Métier<input maxLength={120} value={item.title} onChange={(event) => updateExpertise(index, 'title', event.target.value)} /></label><label className="homepage-field">Présentation<input maxLength={300} value={item.description} onChange={(event) => updateExpertise(index, 'description', event.target.value)} /></label><label className="homepage-field">Icône<select value={item.icon} onChange={(event) => updateExpertise(index, 'icon', event.target.value)}>{iconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><button className="icon-button danger-button" type="button" aria-label={`Supprimer le métier ${item.title || index + 1}`} onClick={() => removeExpertise(index)} disabled={content.expertise.items.length <= 1}><Trash2 size={16} /></button></article>)}</div>
      </section>

      <section className="homepage-editor-section" aria-labelledby="home-presence-editor-title">
        <div className="homepage-editor-section-heading"><div><p className="eyebrow">03 · ANCRAGE RÉGIONAL</p><h2 id="home-presence-editor-title">Implantations</h2><p>Le titre et l’introduction au-dessus des cinq pays gérés dans « Filiales ».</p></div><span className="homepage-section-index">03</span></div>
        <div className="homepage-editor-grid"><label className="homepage-field">Surtitre<input maxLength={120} value={content.presence.eyebrow} onChange={(event) => updateSection('presence', 'eyebrow', event.target.value)} /></label><label className="homepage-field">Titre<input maxLength={150} value={content.presence.title} onChange={(event) => updateSection('presence', 'title', event.target.value)} /></label><label className="homepage-field homepage-field--wide">Introduction<textarea rows={2} maxLength={300} value={content.presence.description} onChange={(event) => updateSection('presence', 'description', event.target.value)} /></label></div>
      </section>

      <section className="homepage-editor-section" aria-labelledby="home-companies-editor-title">
        <div className="homepage-editor-section-heading"><div><p className="eyebrow">04 · ENTREPRISES DU GROUPE</p><h2 id="home-companies-editor-title">Nos entreprises</h2><p>Logos et liens présentés sur la page d’accueil.</p></div><button className="secondary-button" type="button" onClick={addCompany} disabled={content.companies.items.length >= 12}><Plus size={16} /> Ajouter une entreprise</button></div>
        <div className="homepage-editor-grid"><label className="homepage-field">Surtitre<input maxLength={120} value={content.companies.eyebrow} onChange={(event) => updateSection('companies', 'eyebrow', event.target.value)} /></label><label className="homepage-field">Titre<input maxLength={150} value={content.companies.title} onChange={(event) => updateSection('companies', 'title', event.target.value)} /></label></div>
        <div className="homepage-editor-list">{content.companies.items.map((item, index) => <article className="homepage-company-row" key={`company-${index}`}><img src={item.image || '/media/legacy/ANIEKGROUP.webp'} alt={`Aperçu ${item.name}`} /><div className="homepage-company-fields"><label className="homepage-field">Entreprise<input maxLength={120} value={item.name} onChange={(event) => updateCompany(index, 'name', event.target.value)} /></label><label className="homepage-field">Chemin du logo<input maxLength={255} value={item.image} onChange={(event) => updateCompany(index, 'image', event.target.value)} placeholder="/media/legacy/logo.png" /></label><label className="homepage-field">Lien du site<input type="url" maxLength={255} value={item.href} onChange={(event) => updateCompany(index, 'href', event.target.value)} placeholder="https://exemple.com" /></label></div><button className="icon-button danger-button" type="button" aria-label={`Supprimer ${item.name || 'cette entreprise'}`} onClick={() => removeCompany(index)} disabled={content.companies.items.length <= 1}><Trash2 size={16} /></button></article>)}</div>
      </section>

      <section className="homepage-editor-section" aria-labelledby="home-partner-editor-title">
        <div className="homepage-editor-section-heading"><div><p className="eyebrow">05 · ACCÈS PROFESSIONNEL</p><h2 id="home-partner-editor-title">Espace partenaires</h2><p>L’invitation et le bouton en bas de la page d’accueil.</p></div><span className="homepage-section-index">05</span></div>
        <div className="homepage-editor-grid"><label className="homepage-field">Surtitre<input maxLength={120} value={content.partnerCallout.eyebrow} onChange={(event) => updateSection('partnerCallout', 'eyebrow', event.target.value)} /></label><label className="homepage-field">Texte du bouton<input maxLength={80} value={content.partnerCallout.buttonLabel} onChange={(event) => updateSection('partnerCallout', 'buttonLabel', event.target.value)} /></label><label className="homepage-field homepage-field--wide">Titre<input maxLength={150} value={content.partnerCallout.title} onChange={(event) => updateSection('partnerCallout', 'title', event.target.value)} /></label><label className="homepage-field homepage-field--wide">Description<textarea rows={2} maxLength={300} value={content.partnerCallout.description} onChange={(event) => updateSection('partnerCallout', 'description', event.target.value)} /></label></div>
      </section>

      {error && <p className="form-error homepage-editor-error" role="alert">{error}</p>}
      <footer className="homepage-editor-footer"><span><Check size={15} /> Toute publication est enregistrée dans le journal d’activité.</span><button className="primary-button" type="button" onClick={() => void publish()} disabled={saving || loadFailed}><Save size={17} /> {saving ? 'Publication…' : loadFailed ? 'Contenu indisponible' : 'Publier les modifications'}</button></footer>
    </div>
  )
}
