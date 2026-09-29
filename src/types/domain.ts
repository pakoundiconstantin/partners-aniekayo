export type PartnerCategory = 'automobile' | 'industrie' | 'outillage' | 'informatique' | 'logistique' | 'autre'

export interface Partner {
  id: string
  name: string
  category: PartnerCategory
  categoryId?: number
  categoryName?: string
  logo: string
  website: string
  active: boolean
}

export interface Country {
  id: string
  backendId?: number
  name: string
  flag: string
  registration: string
  taxNumber: string
  phone: string
  email: string
  address: string
  director: string
  agencyName?: string
  city?: string
  postalCode?: string
  directorTitle?: string
  currency?: string
  emailSecondary?: string
  phoneEmergency?: string
  openingHours?: string
  portals?: CountryPortal[]
}

export interface CountryPortal {
  name: string
  website: string
  image: string
}

export interface PartnerCategoryOption {
  id: number
  name: string
  slug: string
}

export interface TeamSheet {
  id: number
  title: string
  image: string
}

export interface ActivityEntry {
  id: string
  action: string
  target: string
  date: string
}

export interface AppSnapshot {
  partners: Partner[]
  categories: PartnerCategoryOption[]
  countries: Country[]
  teamSheets: TeamSheet[]
  activity: ActivityEntry[]
}