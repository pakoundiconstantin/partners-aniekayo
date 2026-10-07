import type { AppSnapshot, Partner, PartnerCategory } from '../types/domain'
import { legacyCountries } from './legacyData'

export const categoryLabels: Record<PartnerCategory, string> = {
  automobile: 'Automobile',
  industrie: 'Industrie',
  outillage: 'Outillage',
  informatique: 'Informatique',
  logistique: 'Logistique',
  autre: 'Autre',
  portails: 'Portails & services',
}

export function categoryFromSlug(slug = ''): PartnerCategory {
  const normalized = slug
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')

  if (normalized.includes('automobile') || normalized.includes('moteur') || normalized.includes('pieces-pl') || normalized.includes('equipements-lourds')) return 'automobile'
  if (normalized.includes('outillage')) return 'outillage'
  if (normalized.includes('informatique')) return 'informatique'
  if (normalized.includes('electricite')) return 'industrie'
  if (normalized.includes('logistique')) return 'logistique'
  if (normalized.includes('autre') || normalized.includes('entites')) return 'autre'
  if (normalized.includes('portail')) return 'portails'
  if (normalized.includes('industrie')) return 'industrie'
  return 'industrie'
}

export const fallbackPartners: Partner[] = [
  { id: 'fallback-caterpillar', name: 'CATERPILLAR', category: 'automobile', logo: '/media/partners/CATERPILLAR.png', website: 'https://www.caterpillar.com/', active: true, featured: true },
  { id: 'fallback-jcb', name: 'JCB', category: 'automobile', logo: '/media/partners/JCB-.png', website: 'https://www.jcb.com/', active: true, featured: true },
  { id: 'fallback-atlas-copco', name: 'Atlas Copco', category: 'outillage', logo: '/media/partners/atlas%20copco.webp', website: 'https://www.atlascopco.com', active: true, featured: true },
  { id: 'fallback-cummins', name: 'Cummins', category: 'automobile', logo: '/media/partners/cummins.jpg.jpeg', website: 'https://www.cummins.com', active: true, featured: true },
  { id: 'fallback-hifi-filter', name: 'Hifi Filter', category: 'automobile', logo: '/media/partners/hifi.webp', website: 'https://hifi-filter.com/fr/', active: true, featured: true },
  { id: 'fallback-febi-bilstein', name: 'febi bilstein', category: 'automobile', logo: '/media/partners/part-finder.jpg', website: 'https://partsfinder.bilsteingroup.com/fr/index?t=a&q=12345', active: true },
  { id: 'fallback-as-pl', name: 'AS-PL', category: 'automobile', logo: '/media/partners/AS-pl.jpg', website: 'https://as-pl.com/fr/cms/front/contact', active: true },
  { id: 'fallback-wurth', name: 'Würth', category: 'industrie', logo: '/media/partners/wurth.jpg', website: 'https://www.wurth-industrie.fr/', active: true, featured: true },
  { id: 'fallback-sam-outillage', name: 'SAM Outillage', category: 'outillage', logo: '/media/partners/sam-outillage.png', website: 'https://www.sam-outillage.fr/', active: true, featured: true },
  { id: 'fallback-ks-tools', name: 'KS Tools', category: 'outillage', logo: '/media/partners/kstool-logo.png', website: 'https://www.kstools.fr/', active: true },
  { id: 'fallback-123-roulement', name: '123 Roulement', category: 'industrie', logo: '/media/partners/123-roulement.png', website: 'https://www.123roulement.com/', active: true, featured: true },
  { id: 'fallback-roulements-courroies', name: 'Roulements Courroies', category: 'industrie', logo: '/media/partners/logo.svg', website: 'https://www.roulements-courroies.com/', active: true },
  { id: 'fallback-abb', name: 'ABB', category: 'industrie', logo: '/media/partners/abb-logo-png-transparent.png', website: 'https://new.abb.com/fr', active: true, featured: true },
  { id: 'fallback-varta-automotive', name: 'Varta Automotive', category: 'automobile', logo: '/media/partners/vatar.jpg', website: 'https://www.varta-automotive.com', active: true, featured: true },
  { id: 'fallback-tecalliance-tecdoc', name: 'TecAlliance / TecDoc', category: 'automobile', logo: '/media/partners/Tecalliance.jpg', website: 'https://web.tecalliance.net/tecdoc/fr/home', active: true, featured: true },
  { id: 'fallback-tvh', name: 'TVH', category: 'automobile', logo: '/media/partners/tvh.png', website: 'https://eshop.tvh.com/fr-tg', active: true, featured: true },
  { id: 'fallback-aniekgroup', name: 'ANIEKGROUP', category: 'autre', logo: '/media/partners/ANIEKGROUP.webp', website: 'https://www.aniekgroup.com/', active: true, featured: true },
  { id: 'fallback-apt', name: 'APT', category: 'autre', logo: '/media/partners/apt.jpeg', website: 'https://www.aptint.com/fr', active: true, featured: true },
  { id: 'fallback-kbsc', name: 'KBSC', category: 'autre', logo: '/media/partners/kbsc.jpg', website: 'https://www.companyweb.be/fr/0676771374/kbs-construct', active: true, featured: true },
  { id: 'fallback-keina-group', name: 'Keina Group', category: 'autre', logo: '/media/partners/keinagroup.jpeg', website: 'https://www.keinagroup.com/', active: true, featured: true },
  { id: 'fallback-gms', name: 'GMS', category: 'autre', logo: '/media/partners/keinagroup.jpeg', website: 'https://www.keinagroup.com/', active: true },
  { id: 'fallback-anuba', name: 'ANUBA', category: 'autre', logo: '/media/partners/anuba.jpg', website: '', active: true },
  { id: 'fallback-neyla', name: 'Neyla', category: 'autre', logo: '/media/partners/Neyla.jpg', website: '', active: true },
  { id: 'fallback-dhl', name: 'DHL', category: 'logistique', logo: '/media/partners/DHL_logo_rgb.png', website: 'https://www.dhl.com/fr-fr/home.html', active: true },
  { id: 'fallback-autodoc', name: 'Autodoc', category: 'automobile', logo: '/media/partners/autodoc.png', website: 'https://www.autodoc24.fr/', active: true },
  { id: 'fallback-partsouq', name: 'Partsouq', category: 'automobile', logo: '/media/partners/partsouq.jpg', website: 'https://partsouq.com', active: true },
  { id: 'fallback-deer', name: 'Deer', category: 'automobile', logo: '/media/partners/Deer.jpg', website: 'https://www.deer-online.com/', active: true },
  { id: 'fallback-vin-decoderz', name: 'VIN Decoderz', category: 'automobile', logo: '/media/partners/vin-decoderz-logo-alt.svg', website: 'https://www.vindecoderz.com/', active: true },
  { id: 'fallback-ridex', name: 'RIDEX', category: 'automobile', logo: '/media/partners/ridex.jpg', website: 'https://fr.ridex.eu/', active: true },
  { id: 'fallback-tecdoc', name: 'TecDoc', category: 'automobile', logo: '/media/partners/tecdoc.jpg', website: 'https://web.tecalliance.net/tecdoc/fr/home', active: true },
  { id: 'fallback-cedeo', name: 'Cedeo', category: 'industrie', logo: '/media/partners/logo_cedeo.png', website: 'https://www.cedeo.fr/', active: true },
  { id: 'fallback-caro', name: 'Caro', category: 'informatique', logo: '/media/partners/Caro.png', website: 'https://boutique.carolburo.com/connexion?back=my-account', active: true },
  { id: 'fallback-difcaa', name: 'Difcaa', category: 'industrie', logo: '/media/partners/Difcaa.jpg', website: 'http://www.difcaa.com/', active: true },
  { id: 'fallback-j360', name: 'J360', category: 'autre', logo: '/media/partners/j360.svg', website: 'https://app.j360.info/#/my-monitoring', active: true },
  { id: 'fallback-av10', name: 'AV10', category: 'industrie', logo: '/media/partners/AV-10.jpg', website: 'http://www.av10.eu/', active: true },
  { id: 'fallback-alibaba', name: 'Alibaba', category: 'autre', logo: '/media/partners/OIP.webp', website: 'https://www.alibaba.com/', active: true },
  { id: 'fallback-latty', name: 'Latty', category: 'industrie', logo: '/media/partners/LATTY.png', website: 'https://latty.com/', active: true },
  { id: 'fallback-cimtec', name: 'CIMTEC', category: 'industrie', logo: '/media/partners/CIMTEC.jpg', website: 'https://cimtecautomation.com/', active: true },
  { id: 'fallback-ndc-pro', name: 'NDC Pro', category: 'industrie', logo: '/media/partners/nd.png', website: 'https://ndcpro.fr/', active: true },
  { id: 'fallback-tano-cable', name: 'Tano Cable', category: 'industrie', logo: '/media/partners/tano.png', website: 'https://www.tanocable.com/', active: true },
  { id: 'fallback-bts-energy', name: 'BTS Energy Avis', category: 'industrie', logo: '/media/partners/bts.png', website: 'https://www.bts-energy-avis.com/', active: true },
  { id: 'fallback-madic', name: 'MADIC', category: 'industrie', logo: '/media/partners/madi.png', website: 'https://groupe.madic.com/madic-group/', active: true },
  { id: 'fallback-equipauto', name: 'Equipauto', category: 'automobile', logo: '/media/partners/Equipauto.jpg', website: 'https://equipauto.mybadgeonline.com', active: true },
  { id: 'fallback-gazdetect', name: 'GazDetect', category: 'industrie', logo: '/media/partners/gazdetect.webp', website: 'https://www.gazdetect.com/', active: true },
  { id: 'fallback-challenge', name: 'Challenge', category: 'autre', logo: '/media/partners/challenge.webp', website: 'https://www.challenge.ma/', active: true },
  { id: 'fallback-carmo', name: 'Carmo', category: 'automobile', logo: '/media/partners/carmo.jpg.jpeg', website: 'https://carmo.dk/', active: true },
  { id: 'fallback-carol-buro', name: 'Carol Buro', category: 'informatique', logo: '/media/partners/Carol-Buro-Rogne.jpg.jpeg', website: 'https://boutique.carolburo.com/connexion?back=my-account', active: true },
  { id: 'fallback-apollo', name: 'Apollo', category: 'autre', logo: '/media/partners/OIP%20copy.webp', website: 'https://www.apollo.io/fr', active: true },
  { id: 'fallback-ais-international', name: 'AIS International', category: 'industrie', logo: '/media/partners/AIS_Belgium.webp', website: 'https://www.aisbelgium.be/fr/services', active: true },
  { id: 'fallback-otr-dimana', name: 'OTR DIMANA', category: 'portails', logo: '/media/partners/img1.png', website: 'https://dimana.otr.tg/ETaxe/faces/authentification?_adf.ctrl-state=16erzj2ztf_3', active: true },
  { id: 'fallback-otr-gudef', name: 'OTR GUDEF', category: 'portails', logo: '/media/partners/gudef.jpg', website: 'https://gudef.otr.tg/', active: true },
  { id: 'fallback-arcop', name: 'ARCOP', category: 'portails', logo: '/media/partners/arcop.jpg', website: 'https://passe.arcop.tg/publics/lite-egp', active: true },
  { id: 'fallback-cnss-togo', name: 'CNSS Togo', category: 'portails', logo: '/media/partners/cnss.png', website: 'https://services.cnss.tg/services/login', active: true },
  { id: 'fallback-cfe-togo', name: 'CFE Togo', category: 'portails', logo: '/media/partners/cfe.png', website: 'https://www.cfetogo.tg/portail_cfe.html', active: true },
  { id: 'fallback-odoo', name: 'Odoo', category: 'portails', logo: '/media/partners/odoo.jpg', website: 'https://www.odoo.com/fr_FR/my/databases', active: true },
  { id: 'fallback-dgi-mali', name: 'DGI Mali', category: 'portails', logo: '/media/partners/dgi_mali.jpeg', website: 'https://www.dgi.gouv.ml/', active: true },
  { id: 'fallback-cmss-mali', name: 'CMSS Mali', category: 'portails', logo: '/media/partners/cmss.png', website: '', active: true },
  { id: 'fallback-dgi-ci', name: 'DGI Côte d’Ivoire', category: 'portails', logo: '/media/partners/e-impots.png', website: 'https://e-impots.gouv.ci/', active: true },
  { id: 'fallback-fne-ci', name: 'FNE Côte d’Ivoire', category: 'portails', logo: '/media/partners/fne.png', website: 'https://www.services.fne.dgi.gouv.ci/fr/login', active: true },
  { id: 'fallback-cnss-ci', name: 'CNSS Côte d’Ivoire', category: 'portails', logo: '/media/partners/cnss.ci.png', website: 'https://e.cnps.ci/', active: true },
  { id: 'fallback-mde-niger', name: 'MDE Niger', category: 'portails', logo: '/media/partners/logome.png', website: 'https://www.mde.ne/', active: true },
  { id: 'fallback-cci-niger', name: 'CCI Niger', category: 'portails', logo: '/media/partners/logoccin.jpg', website: 'https://cciniger.org/', active: true },
  { id: 'fallback-cnpg-niger', name: 'CNPG Niger', category: 'portails', logo: '/media/partners/logodev.svg', website: 'https://www.developmentaid.org/organizations/view/410648/cnpg-centre-national-de-perfectionnement-a-la-gestion', active: true },
  { id: 'fallback-eregulations-niger', name: 'eRegulations Niger', category: 'portails', logo: '/media/partners/logoeregulation.png', website: 'https://niger.eregulations.org/', active: true },
  { id: 'fallback-cman-niger', name: 'CMAN Niger', category: 'portails', logo: '/media/partners/cman.webp', website: 'http://www.cman.ne', active: true },
  { id: 'fallback-anipex', name: 'ANIPEX', category: 'portails', logo: '/media/partners/anipex_logo.png', website: 'https://www.anipex.org/', active: true },
  { id: 'fallback-armp-niger', name: 'ARMP Niger', category: 'portails', logo: '/media/partners/armp-logo.jpg', website: 'https://www.armp-niger.org/', active: true },
]

export const initialSnapshot: AppSnapshot = {
  partners: [],
  categories: [],
  countries: legacyCountries,
  teamSheets: [],
  activity: [],
}