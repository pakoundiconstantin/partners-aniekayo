export type PartnerCategory = 'automobile' | 'industrie' | 'outillage' | 'informatique' | 'logistique' | 'autre' | 'portails'

export interface Partner {
  id: string
  name: string
  category: PartnerCategory
  categoryId?: number
  categoryName?: string
  logo: string
  website: string
  active: boolean
  featured?: boolean
  description?: string
  updatedAt?: string
  countryCodes?: string[]
}

export interface Country {
  id: string
  backendId?: number
  isoCode?: string
  name: string
  flag: string
  registration: string
  taxNumber: string
  phone: string
  phoneLabel?: string
  commercialNumber?: string
  email: string
  address: string
  director: string
  agencyName?: string
  postOfficeBox?: string
  city?: string
  postalCode?: string
  directorTitle?: string
  currency?: string
  emailSecondary?: string
  phoneEmergency?: string
  openingHours?: string
  monthlyReminders?: CountryReminder[]
  reminderNote?: string
  portals?: CountryPortal[]
}

export interface CountryReminder {
  label: string
  value: string
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

export type ExpertiseIcon = 'Factory' | 'HardHat' | 'Wrench' | 'Building2'

export interface HomepageContent {
  hero: {
    eyebrow: string
    title: string
    highlight: string
    description: string
    image: string
  }
  expertise: {
    eyebrow: string
    title: string
    description: string
    items: Array<{ title: string; description: string; icon: ExpertiseIcon }>
  }
  presence: {
    eyebrow: string
    title: string
    description: string
  }
  companies: {
    eyebrow: string
    title: string
    items: Array<{ name: string; image: string; href: string }>
  }
  partnerCallout: {
    eyebrow: string
    title: string
    description: string
    buttonLabel: string
    href: '/partners'
  }
}