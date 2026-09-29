import type { AppSnapshot, PartnerCategory } from '../types/domain'
import { legacyCountries } from './legacyData'

export const categoryLabels: Record<PartnerCategory, string> = {
  automobile: 'Automobile',
  industrie: 'Industrie',
  outillage: 'Outillage',
  informatique: 'Informatique',
  logistique: 'Logistique',
  autre: 'Autre',
}

export function categoryFromSlug(slug = ''): PartnerCategory {
  if (slug.includes('moteur') || slug.includes('pieces-pl')) return 'automobile'
  if (slug.includes('outillage')) return 'outillage'
  if (slug.includes('electricite')) return 'informatique'
  if (slug.includes('entites')) return 'autre'
  return 'industrie'
}

export const initialSnapshot: AppSnapshot = {
  partners: [],
  categories: [],
  countries: legacyCountries,
  teamSheets: [],
  activity: [],
}