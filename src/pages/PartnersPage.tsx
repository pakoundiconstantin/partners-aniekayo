import { useDeferredValue, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  ExternalLink,
  FileImage,
  LoaderCircle,
  Search,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";
import { NormalizedLogo } from "../components/NormalizedLogo";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { TeamViewer } from "../components/TeamViewer";
import { categoryLabels, fallbackPartners } from "../data/initialData";
import { useAppData } from "../services/dataStore";
import type { PartnerCategory } from "../types/domain";
import "./PartnersPage.css";

const categories: Array<"all" | PartnerCategory> = [
  "all",
  "automobile",
  "industrie",
  "outillage",
  "informatique",
  "logistique",
  "autre",
  "portails",
];
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");

export function PartnersPage() {
  const { data, apiStatus } = useAppData();
  const displayedPartners =
    data.partners.length > 0 ? data.partners : fallbackPartners;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | PartnerCategory>("all");
  const [viewerOpen, setViewerOpen] = useState(false);
  const deferredQuery = useDeferredValue(normalize(query.trim()));
  const activePartners = displayedPartners.filter((partner) => partner.active);
  const featuredPartners = activePartners.filter((partner) => partner.featured);
  const partners = activePartners.filter(
    (partner) =>
      (category === "all" || partner.category === category) &&
      normalize(`${partner.name} ${categoryLabels[partner.category]}`).includes(
        deferredQuery,
      ),
  );
  const latestUpdate = activePartners
    .map((partner) => partner.updatedAt)
    .filter((date): date is string => Boolean(date))
    .sort((first, second) => Date.parse(second) - Date.parse(first))[0];
  const latestUpdateLabel = latestUpdate
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
      }).format(new Date(latestUpdate))
    : "Non disponible";
  const isLoading = apiStatus.state === "loading";
  const isError = apiStatus.state === "error";
  const hasData = displayedPartners.length > 0;

  return (
    <>
      <SiteHeader />
      <main className="partners-page">
        <section className="partners-overview" aria-label="Aperçu du catalogue">
          <div className="partners-overview__stat">
            <span className="partners-overview__icon">
              <UsersRound size={21} aria-hidden="true" />
            </span>
            <div>
              <strong>{activePartners.length}</strong>
              <span>Partenaires actifs</span>
            </div>
          </div>
          <div className="partners-overview__status">
            <span
              className={`partners-status-dot ${
                isLoading ? "is-loading" : isError ? "is-error" : "is-ready"
              }`}
            />
            <span>
              {isLoading
                ? "Chargement du catalogue…"
                : isError
                  ? "Données disponibles avec avertissement"
                  : hasData
                    ? "Catalogue synchronisé"
                    : "Aucune entrée disponible"}
            </span>
          </div>
        </section>

        <section className="strategic-section" aria-labelledby="strategic-title">
          <div className="strategic-section__heading">
            <div>
              <p className="eyebrow">Partenaires prioritaires</p>
              <h2 id="strategic-title">Partenaires stratégiques</h2>
              <p>
                Des marques mises en avant pour accompagner les besoins
                techniques, opérationnels et innovants du groupe.
              </p>
            </div>
            <div className="strategic-section__meta">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>{featuredPartners.length} marque{featuredPartners.length > 1 ? "s" : ""} mise{featuredPartners.length > 1 ? "s" : ""} en avant</span>
            </div>
          </div>

          {featuredPartners.length ? (
            <div className="strategic-grid">
              {featuredPartners.map((partner) => (
                <article className="strategic-card" key={partner.id}>
                  <div className="strategic-card__logo">
                    {partner.logo ? (
                      <NormalizedLogo source={partner.logo} name={partner.name} />
                    ) : (
                      <span>{partner.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="strategic-card__content">
                    <p className="strategic-card__label">
                      <Star size={13} aria-hidden="true" /> Prioritaire
                    </p>
                    <h3>{partner.name}</h3>
                    <p>{partner.description || categoryLabels[partner.category]}</p>
                    {partner.website && (
                      <a href={partner.website} target="_blank" rel="noreferrer">
                        Visiter le site officiel <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="strategic-empty">
              <ShieldCheck size={20} aria-hidden="true" />
              <p>Aucune marque n’est actuellement mise en avant.</p>
            </div>
          )}
        </section>

        <div className="last-update">
          <CalendarClock size={15} aria-hidden="true" />
          <span>Dernière actualisation du catalogue : {latestUpdateLabel}</span>
        </div>

        <section className="partner-toolbar" aria-label="Recherche et filtres">
          <label className="search-field">
            <Search size={18} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une marque ou une catégorie"
            />
          </label>
          <div className="category-filters">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={
                  category === item ? "filter-chip is-active" : "filter-chip"
                }
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item === "all" ? "Tous" : categoryLabels[item]}
              </button>
            ))}
          </div>
        </section>

        <div className="results-caption" aria-live="polite">
          <span>
            <strong>{partners.length}</strong> résultat{partners.length === 1 ? "" : "s"}
            {query || category !== "all" ? " pour votre sélection" : " du catalogue"}
          </span>
          <span>{activePartners.length} partenaires actifs</span>
        </div>

        {isLoading && !hasData ? (
          <div className="partner-state partner-state--loading" role="status">
            <LoaderCircle size={25} className="is-spin" aria-hidden="true" />
            <h2>Chargement du catalogue</h2>
            <p>Récupération des partenaires et de leurs marques…</p>
          </div>
        ) : isError && !hasData ? (
          <div className="partner-state partner-state--error" role="alert">
            <AlertCircle size={26} aria-hidden="true" />
            <h2>Le catalogue est momentanement indisponible</h2>
            <p>
              Les données du serveur n’ont pas pu être chargées. Vérifiez votre
              connexion puis réessayez.
            </p>
            <button className="secondary-button" type="button" onClick={() => window.location.reload()}>
              Réessayer
            </button>
          </div>
        ) : partners.length ? (
          <div className="partner-grid" aria-label="Liste des partenaires">
            {partners.map((partner) => (
              <a
                className={`partner-card ${partner.website ? "" : "partner-card--unlinked"}`}
                key={partner.id}
                href={partner.website || undefined}
                target={partner.website ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={
                  partner.website
                    ? `${partner.name}, ${categoryLabels[partner.category]} — ouvrir le site officiel`
                    : `${partner.name}, ${categoryLabels[partner.category]} — lien non disponible`
                }
              >
                <div className="partner-logo">
                  {partner.logo ? (
                    <NormalizedLogo source={partner.logo} name={partner.name} />
                  ) : (
                    <div className="partner-logo--empty" aria-hidden="true">
                      <span>{partner.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="partner-card-caption">
                  <span>
                    <strong>{partner.name}</strong>
                    <small>{categoryLabels[partner.category]}</small>
                  </span>
                  {partner.website && <ExternalLink size={16} aria-hidden="true" />}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="partner-state" role="status">
            <Search size={26} aria-hidden="true" />
            <h2>Aucun partenaire ne correspond</h2>
            <p>
              Modifiez la recherche ou sélectionnez une autre catégorie pour
              retrouver les marques du catalogue.
            </p>
          </div>
        )}

        <section className="team-resources" aria-labelledby="team-resources-title">
          <div>
            <p className="eyebrow">Ressources internes</p>
            <h2 id="team-resources-title">Fiches du groupe et compétences</h2>
            <p>
              Consultez séparément les documents d’équipe et les compétences du
              groupe, sans les mélanger avec le catalogue des partenaires.
            </p>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => setViewerOpen(true)}
          >
            <FileImage size={17} aria-hidden="true" />
            {data.teamSheets.length
              ? `Voir les ${data.teamSheets.length} fiches`
              : "Consulter les fiches"}
          </button>
        </section>
      </main>
      <SiteFooter onTeamClick={() => setViewerOpen(true)} />
      {viewerOpen && <TeamViewer onClose={() => setViewerOpen(false)} />}
    </>
  );
}
