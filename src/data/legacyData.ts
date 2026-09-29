import legacyHtml from '../../../backup/index.html?raw'
import type { Country, CountryPortal } from '../types/domain'

const sections = [
  { id: 'togo', sectionId: 'togo', name: 'TOGO', code: 'TG', flag: 'togo.png' },
  { id: 'mali', sectionId: 'mali', name: 'MALI', code: 'ML', flag: 'drapoMali.png' },
  { id: 'cote-d-ivoire', sectionId: 'cote-d-ivoire', name: 'CÔTE D’IVOIRE', code: 'CI', flag: 'CI.png' },
  { id: 'burkina-faso', sectionId: 'brukina-faso', name: 'BURKINA-FASO', code: 'BF', flag: 'burkina-faso.jpg' },
  { id: 'niger', sectionId: 'niger', name: 'NIGER', code: 'NE', flag: 'niger.jpg' },
] as const

const document = new DOMParser().parseFromString(legacyHtml, 'text/html')

function text(element: Element | null): string {
  return element?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr')
}

function portalsFor(section: Element): CountryPortal[] {
  const portals = [...section.querySelectorAll('.companies .company')].flatMap((company) => {
    const image = company.querySelector('img')
    const imagePath = image?.getAttribute('src')?.replace(/^image\//, '')
    if (!image || !imagePath) return []

    const link = company.querySelector('a')
    return [{
      name: image.getAttribute('alt')?.trim() || image.getAttribute('title')?.trim() || imagePath,
      website: link?.getAttribute('href')?.trim() ?? '',
      image: `/media/legacy/${encodeURIComponent(imagePath)}`,
    }]
  })
  const uniquePortals = new Map<string, CountryPortal>()

  for (const portal of portals) {
    uniquePortals.set(`${portal.website}|${portal.image}`, portal)
  }

  return [...uniquePortals.values()]
}

function countryFromHtml(config: (typeof sections)[number]): Country {
  const section = document.querySelector(`section#${config.sectionId}`)
  const infoTable = section?.querySelector('.country-contact-table')
  const rows = [...(infoTable?.querySelectorAll('tr') ?? [])].map((row) => {
    const cells = row.querySelectorAll('td')
    return [normalize(text(cells.item(0))), text(cells.item(1))] as const
  })
  const valueFor = (label: string) => rows.find(([name]) => name.includes(label))?.[1] ?? ''
  const addressStrip = section?.querySelector('.address-strip')
  const deliveryAddresses = [...(addressStrip?.querySelectorAll('span') ?? [])]
    .map(text)
    .filter(Boolean)
    .join(' | ')

  return {
    id: config.id,
    name: config.name,
    flag: config.flag,
    registration: valueFor('registre'),
    taxNumber: valueFor('fiscale'),
    phone: valueFor('telephone') || valueFor('commercial'),
    email: rows.find(([label]) => label.includes('e-mail'))?.[1] ?? '',
    address: deliveryAddresses || valueFor('bp'),
    director: '',
    portals: section ? portalsFor(section) : [],
  }
}

export const legacyCountries: Country[] = sections.map(countryFromHtml)