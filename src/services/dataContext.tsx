import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { categoryFromSlug, fallbackPartners, initialSnapshot } from '../data/initialData'
import type { AppSnapshot } from '../types/domain'
import { DataContext } from './dataStore'
import { apiBaseUrl, apiMediaUrl, apiRequest } from './apiClient'
import { authService } from './authService'

const DATA_KEY = 'aniek.content.v1'
const API_DATA_KEY = 'aniek.api-content.v1'
const legacyCountryIds: Record<string, string> = { TG: 'togo', ML: 'mali', CI: 'cote-d-ivoire', BF: 'burkina-faso', NE: 'niger' }
interface ApiEnvelope<T> {
  data: T
}

interface ApiPartner {
  id: number
  name: string
  slug: string
  category_id?: number
  website_url: string | null
  logo_path: string | null
  is_active: boolean
  is_featured?: boolean
  description?: string | null
  updated_at?: string
  category?: { name?: string; slug?: string }
  countries?: Array<{ code_iso: string; name?: string }>
}

interface ApiCountry {
  id: number
  code_iso: string
  name: string
  branch_office?: {
    agency_name?: string | null
    address?: string | null
    city?: string | null
    postal_code?: string | null
    director_name?: string | null
    director_title?: string | null
    email_primary?: string | null
    email_secondary?: string | null
    phone_standard?: string | null
    phone_emergency?: string | null
    opening_hours?: string | null
  } | null
  currency?: string | null
}

interface ApiTeamSheet {
  id: number
  page_number?: number
  title: string
  image_path: string | null
}

interface ApiCategory {
  id: number
  name: string
  slug: string
}

interface ApiAuditLog {
  id: number
  action: string
  entity_type: string
  entity_id: number
  created_at: string
}

function mapPartner(partner: ApiPartner): AppSnapshot['partners'][number] {
  const logoName = partner.logo_path?.split('/').pop()
  const logoFallback = logoName ? `/media/partners/${encodeURIComponent(logoName)}` : ''
  return {
    id: String(partner.id),
    name: partner.name,
    category: categoryFromSlug(partner.category?.slug),
    categoryId: partner.category_id,
    categoryName: partner.category?.name,
    logo: apiMediaUrl(partner.logo_path) || logoFallback,
    website: partner.website_url ?? '',
    active: partner.is_active,
    featured: partner.is_featured === true,
    description: partner.description ?? undefined,
    updatedAt: partner.updated_at ?? undefined,
    countryCodes: partner.countries?.map((country) => country.code_iso) ?? [],
  }
}

function mapCountry(country: ApiCountry): AppSnapshot['countries'][number] {
  const countryCode = country.code_iso.toUpperCase()
  const legacyId = legacyCountryIds[countryCode] ?? country.code_iso.toLocaleLowerCase()
  const legacy = initialSnapshot.countries.find((item) => item.id === legacyId)
  const office = country.branch_office
  return {
    ...legacy,
    id: legacyId,
    isoCode: countryCode,
    name: country.name,
    flag: legacy?.flag ?? '',
    registration: legacy?.registration ?? '',
    taxNumber: legacy?.taxNumber ?? '',
    phone: office?.phone_standard ?? legacy?.phone ?? '',
    email: office?.email_primary ?? legacy?.email ?? '',
    address: office?.address ?? legacy?.address ?? '',
    director: office?.director_name ?? legacy?.director ?? '',
    backendId: country.id,
    agencyName: office?.agency_name ?? '',
    city: office?.city ?? '',
    postalCode: office?.postal_code ?? '',
    directorTitle: office?.director_title ?? '',
    currency: country.currency ?? '',
    emailSecondary: office?.email_secondary ?? '',
    phoneEmergency: office?.phone_emergency ?? '',
    openingHours: office?.opening_hours ?? '',
  }
}

function mapTeamSheet(sheet: ApiTeamSheet): AppSnapshot['teamSheets'][number] {
  const pageNumber = sheet.page_number ?? sheet.id
  const imagePath = sheet.image_path?.replace(/\\/g, '/')
  const isBundledTeamSheet = imagePath ? /^team\/pages\/\d+\.webp$/i.test(imagePath) : false

  return {
    id: sheet.id,
    title: sheet.title,
    image: isBundledTeamSheet
      ? `/media/team/${pageNumber}.webp`
      : apiMediaUrl(imagePath) || `/media/team/${pageNumber}.webp`,
  }
}

function mapAuditLog(entry: ApiAuditLog): AppSnapshot['activity'][number] {
  const actionLabels: Record<string, string> = {
    create: 'Création',
    update: 'Mise à jour',
    delete: 'Suppression',
    upload: 'Remplacement de fiche',
    login: 'Connexion',
    logout: 'Déconnexion',
  }
  return {
    id: String(entry.id),
    action: actionLabels[entry.action] ?? entry.action,
    target: `${entry.entity_type.split('\\').pop() ?? 'Élément'} #${entry.entity_id}`,
    date: entry.created_at,
  }
}

function mergeSnapshot(snapshot: Partial<AppSnapshot>): AppSnapshot {
  const storedCountries = Array.isArray(snapshot.countries) ? snapshot.countries : []
  const countries = initialSnapshot.countries.map((country) => {
    const savedCountry = storedCountries.find((item) => item.id === country.id)
    if (!savedCountry) return country

    return {
      ...country,
      ...savedCountry,
      registration: savedCountry.registration || country.registration,
      taxNumber: savedCountry.taxNumber || country.taxNumber,
      phone: savedCountry.phone || country.phone,
      phoneLabel: country.phoneLabel,
      commercialNumber: country.commercialNumber,
      email: savedCountry.email || country.email,
      address: savedCountry.address || country.address,
      postOfficeBox: savedCountry.postOfficeBox || country.postOfficeBox,
      monthlyReminders: country.monthlyReminders,
      reminderNote: country.reminderNote,
      portals: savedCountry.portals?.length ? savedCountry.portals : country.portals ?? [],
    }
  })

  return {
    ...initialSnapshot,
    ...snapshot,
    countries: [
      ...countries,
      ...storedCountries.filter((country) => !initialSnapshot.countries.some((initialCountry) => initialCountry.id === country.id)),
    ],
  }
}

function loadSnapshot(): AppSnapshot {
  try {
    const stored = localStorage.getItem(DATA_KEY)
    return stored ? mergeSnapshot(JSON.parse(stored) as Partial<AppSnapshot>) : initialSnapshot
  } catch {
    return initialSnapshot
  }
}

function loadApiSnapshot(): AppSnapshot {
  try {
    const stored = localStorage.getItem(API_DATA_KEY)
    if (!stored) return { ...initialSnapshot, partners: fallbackPartners }
    const value: unknown = JSON.parse(stored)
    if (typeof value !== 'object' || value === null) return { ...initialSnapshot, partners: fallbackPartners }
    const cached = value as Partial<AppSnapshot>
    const partners = Array.isArray(cached.partners) && cached.partners.length > 0 ? cached.partners : fallbackPartners
    return mergeSnapshot({
      partners,
      categories: Array.isArray(cached.categories) ? cached.categories : [],
      countries: Array.isArray(cached.countries) ? cached.countries : [],
      teamSheets: Array.isArray(cached.teamSheets) ? cached.teamSheets : [],
      activity: [],
    })
  } catch {
    return { ...initialSnapshot, partners: fallbackPartners }
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [data, setData] = useState(() => apiBaseUrl ? loadApiSnapshot() : loadSnapshot())
  const [apiStatus, setApiStatus] = useState<{ state: 'demo' | 'loading' | 'connected' | 'error'; message?: string }>(
    () => ({ state: apiBaseUrl ? 'loading' : 'demo' }),
  )

  const refreshAdmin = useCallback(async () => {
    const token = authService.getSession()?.token
    if (!apiBaseUrl || !token) return
    try {
      const requests = [
        apiRequest<ApiEnvelope<{ data: ApiPartner[] }>>('/admin/partners?per_page=100', { token })
          .then(({ data: result }) => setData((current) => ({ ...current, partners: result.data.map(mapPartner) }))),
        apiRequest<ApiEnvelope<ApiCountry[]>>('/admin/countries', { token })
          .then(({ data: result }) => setData((current) => ({ ...current, countries: result.map(mapCountry) }))),
        apiRequest<ApiEnvelope<ApiTeamSheet[]>>('/admin/team-sheets', { token })
          .then(({ data: result }) => setData((current) => ({ ...current, teamSheets: result.map(mapTeamSheet) }))),
        apiRequest<ApiEnvelope<ApiCategory[]>>('/admin/partner-categories', { token })
          .then(({ data: result }) => setData((current) => ({ ...current, categories: result }))),
        apiRequest<ApiEnvelope<{ data: ApiAuditLog[] }>>('/admin/audit-logs?per_page=100', { token })
          .then(({ data: result }) => setData((current) => ({ ...current, activity: result.data.map(mapAuditLog) }))),
      ]
      const results = await Promise.allSettled(requests)
      const failedRequest = results.find((result) => result.status === 'rejected')
      if (failedRequest?.status === 'rejected') throw failedRequest.reason
      setApiStatus({ state: 'connected' })
    } catch (reason) {
      setApiStatus({ state: 'error', message: reason instanceof Error ? reason.message : 'Chargement admin impossible.' })
      throw reason
    }
  }, [])

  useEffect(() => {
    if (!apiBaseUrl || pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/partners/login' || pathname === '/admin/login') return
    let active = true
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      if (!active) return
      setData((current) => current.countries.length
        ? current
        : { ...current, countries: initialSnapshot.countries })
      setApiStatus({ state: 'error', message: 'Certaines données du serveur sont indisponibles.' })
    }, 10000)

    async function loadFromApi() {
      try {
        const partnersRequest = apiRequest<ApiEnvelope<ApiPartner[]>>('/partners', { signal: controller.signal })
        const supportingRequests = Promise.allSettled([
          apiRequest<ApiEnvelope<ApiCountry[]>>('/countries', { signal: controller.signal }),
          apiRequest<ApiEnvelope<ApiTeamSheet[]>>('/team-sheets', { signal: controller.signal }),
          apiRequest<ApiEnvelope<ApiCategory[]>>('/partners/categories', { signal: controller.signal }),
        ])
        const [partners] = await Promise.allSettled([partnersRequest])
        if (!active) return

        setData((current) => ({
          ...current,
          partners: partners.status === 'fulfilled' && partners.value.data.length > 0
            ? partners.value.data.map(mapPartner)
            : (current.partners.length > 0 ? current.partners : fallbackPartners),
        }))
        setApiStatus(partners.status === 'fulfilled' && partners.value.data.length > 0
          ? { state: 'connected' }
          : { state: 'error', message: 'Certaines données du serveur sont indisponibles.' })
        window.clearTimeout(timeoutId)

        const [countries, sheets, categories] = await supportingRequests
        if (!active) return
        setData((current) => ({
          ...current,
          countries: countries.status === 'fulfilled' ? countries.value.data.map(mapCountry) : current.countries,
          teamSheets: sheets.status === 'fulfilled' ? sheets.value.data.map(mapTeamSheet) : current.teamSheets,
          categories: categories.status === 'fulfilled' ? categories.value.data : current.categories,
        }))
        if ([countries, sheets, categories].some((result) => result.status === 'rejected')) {
          setApiStatus({ state: 'error', message: 'Certaines données du serveur sont indisponibles.' })
        }
      } catch {
        if (!active) return
        setData((current) => ({ ...current, countries: initialSnapshot.countries }))
        setApiStatus({ state: 'error', message: 'Certaines données du serveur sont indisponibles.' })
      } finally {
        window.clearTimeout(timeoutId)
      }
    }

    void loadFromApi()
    return () => {
      active = false
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [pathname])

  useEffect(() => {
    if (apiBaseUrl) return
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data))
    } catch {
      // Keep the current session usable when a browser storage quota is reached.
    }
  }, [data])

  useEffect(() => {
    if (!apiBaseUrl) return
    try {
      localStorage.setItem(API_DATA_KEY, JSON.stringify({
        partners: data.partners,
        categories: data.categories,
        countries: data.countries,
        teamSheets: data.teamSheets,
      }))
    } catch {
      // Keep API-backed pages usable when browser storage is unavailable.
    }
  }, [data])

  useEffect(() => {
    if (apiBaseUrl) return
    function handleStorage(event: StorageEvent) {
      if (event.key !== DATA_KEY && event.key !== null) return
      try {
        const stored = event.newValue ? JSON.parse(event.newValue) as Partial<AppSnapshot> : {}
        setData(mergeSnapshot(stored))
      } catch {
        setData(initialSnapshot)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return <DataContext.Provider value={{ data, update: setData, apiStatus, refreshAdmin }}>{children}</DataContext.Provider>
}
