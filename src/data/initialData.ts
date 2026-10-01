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
  const normalized = slug
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')

  if (normalized.includes('automobile') || normalized.includes('moteur') || normalized.includes('pieces-pl')) return 'automobile'
  if (normalized.includes('outillage')) return 'outillage'
  if (normalized.includes('informatique') || normalized.includes('electricite')) return 'informatique'
  if (normalized.includes('logistique')) return 'logistique'
  if (normalized.includes('autre') || normalized.includes('entites')) return 'autre'
  if (normalized.includes('industrie')) return 'industrie'
  return 'industrie'
}

export const initialSnapshot: AppSnapshot = {
  partners: [],
  categories: [],
  countries: legacyCountries,
  teamSheets: [],
  activity: [],
}