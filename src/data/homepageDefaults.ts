import type { HomepageContent } from '../types/domain'

export const homepageContentStorageKey = 'aniek.homepage-content.v1'

export const initialHomepageContent: HomepageContent = {
  hero: {
    eyebrow: 'PARTENAIRE DES ENTREPRISES EN AFRIQUE DE L’OUEST',
    title: 'Un partenaire de confiance pour',
    highlight: 'vos activités.',
    description: 'Présent au Togo, au Mali, en Côte d’Ivoire, au Burkina Faso et au Niger, ANIEK Group Services accompagne les entreprises en équipements industriels, construction et maintenance mécanique.',
    image: '/media/home/industrial-maintenance.jpg',
  },
  expertise: {
    eyebrow: 'CE QUE NOUS FAISONS',
    title: 'Des compétences au service du terrain.',
    description: 'Des métiers complémentaires, réunis pour répondre aux besoins des entreprises et des projets.',
    items: [
      { title: 'Équipements industriels', description: 'Des solutions et équipements pour accompagner les professionnels et les opérations de terrain.', icon: 'Factory' },
      { title: 'Construction & BTP', description: 'Un savoir-faire au service des projets de construction et des infrastructures.', icon: 'HardHat' },
      { title: 'Maintenance mécanique', description: 'Des compétences techniques pour maintenir les équipements et prolonger leur durée de vie.', icon: 'Wrench' },
      { title: 'Services aux entreprises', description: 'Un accompagnement de proximité adapté aux besoins des entreprises.', icon: 'Building2' },
    ],
  },
  presence: {
    eyebrow: 'AU PLUS PRÈS DE VOS ACTIVITÉS',
    title: 'Une présence dans cinq pays.',
    description: 'Retrouvez les coordonnées et les informations de nos implantations.',
  },
  companies: {
    eyebrow: 'NOS ENTREPRISES',
    title: 'Un groupe, des savoir-faire complémentaires.',
    items: [
      { name: 'ANIEK Group', image: '/media/legacy/ANIEKGROUP.webp', href: 'https://www.aniekgroup.com/' },
      { name: 'APT', image: '/media/legacy/apt.jpeg', href: 'https://www.aptint.com/fr' },
      { name: 'KBS Construct', image: '/media/legacy/kbsc.jpg', href: 'https://kbsconstruct.com/' },
      { name: 'Keina Group', image: '/media/legacy/keinagroup.jpeg', href: 'https://www.keinagroup.com/' },
      { name: 'ANUBA', image: '/media/legacy/anuba.jpg', href: '' },
      { name: 'Neyla', image: '/media/legacy/Neyla.jpg', href: '' },
    ],
  },
  partnerCallout: {
    eyebrow: 'ESPACE PROFESSIONNEL',
    title: 'Partenaires, accédez à votre espace dédié.',
    description: 'Retrouvez l’annuaire et les ressources réservées aux partenaires du groupe.',
    buttonLabel: 'Espace partenaires',
    href: '/partners',
  },
}