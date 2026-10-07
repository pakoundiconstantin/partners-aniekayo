import { apiRequest } from './apiClient'
import { authService } from './authService'
import type { Country, HomepageContent, Partner, TeamSheet } from '../types/domain'

function token(): string {
  const value = authService.getSession()?.token
  if (!value) throw new Error('Session administrateur absente. Reconnectez-vous.')
  return value
}

function requireBackendId(id: string | number): number {
  const value = Number(id)
  if (!Number.isInteger(value) || value <= 0) throw new Error('Identifiant backend invalide.')
  return value
}

export async function savePartner(partner: Partner, logo?: File): Promise<void> {
  const categoryId = partner.categoryId
  if (!categoryId) throw new Error('Choisissez une catégorie proposée par le serveur.')

  const existingId = Number(partner.id)
  const isExisting = Number.isInteger(existingId) && existingId > 0
  const credentials = token()
  const fields = {
    name: partner.name,
    category_id: categoryId,
    description: partner.description ?? '',
    website_url: partner.website || null,
    is_active: partner.active,
    is_featured: partner.featured ?? false,
    country_codes: partner.countryCodes ?? [],
  }

  if (isExisting) {
    await apiRequest(`/admin/partners/${existingId}`, { method: 'PUT', body: fields, token: credentials })
    if (logo) {
      const body = new FormData()
      body.append('logo', logo)
      await apiRequest(`/admin/partners/${existingId}/logo`, { method: 'POST', body, token: credentials })
    }
    return
  }

  const body = new FormData()
  body.append('name', fields.name)
  body.append('category_id', String(fields.category_id))
  body.append('description', fields.description)
  body.append('website_url', fields.website_url ?? '')
  body.append('is_active', fields.is_active ? '1' : '0')
  body.append('is_featured', fields.is_featured ? '1' : '0')
  fields.country_codes.forEach((code, index) => body.append(`country_codes[${index}]`, code))
  if (logo) body.append('logo', logo)
  await apiRequest('/admin/partners', { method: 'POST', body, token: credentials })
}

export async function deletePartner(id: string): Promise<void> {
  await apiRequest(`/admin/partners/${requireBackendId(id)}`, { method: 'DELETE', token: token() })
}

export async function saveCountry(country: Country): Promise<void> {
  if (!country.backendId) throw new Error('Identifiant pays backend absent.')
  await apiRequest(`/admin/countries/${country.backendId}`, {
    method: 'PUT',
    token: token(),
    body: {
      name: country.name,
      currency: country.currency || 'Franc CFA (XOF)',
      agency_name: country.agencyName,
      address: country.address,
      city: country.city,
      postal_code: country.postalCode,
      director_name: country.director,
      director_title: country.directorTitle,
      email_primary: country.email,
      email_secondary: country.emailSecondary,
      phone_standard: country.phone,
      phone_emergency: country.phoneEmergency,
      opening_hours: country.openingHours,
    },
  })
}

export async function replaceTeamSheetImage(sheet: TeamSheet, file: File): Promise<void> {
  const body = new FormData()
  body.append('image', file)
  await apiRequest(`/admin/team-sheets/${sheet.id}/replace-image`, { method: 'POST', body, token: token() })
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const response = await apiRequest<{ data: HomepageContent }>('/homepage-content')
  return response.data
}

export async function saveHomepageContent(content: HomepageContent): Promise<HomepageContent> {
  const response = await apiRequest<{ data: HomepageContent }>('/admin/homepage-content', {
    method: 'PUT',
    body: { content },
    token: token(),
  })
  return response.data
}
