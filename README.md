# ANIEK Group Services — Frontend

Application React 19 / TypeScript / Vite, découplée du backend. Le build produit un site statique dans `dist/`, déployable sur un hébergement web classique configuré avec un fallback SPA vers `index.html`.

## Démarrage

```bash
npm install
npm run dev
```

Le serveur de développement Vite affiche l’URL locale au démarrage. Pour vérifier le paquet de production :

```bash
npm run build
npm run preview
```

## Organisation

- `src/pages/` : accueil, connexion, espace partenaires et administration.
- `src/components/` : navigation, pied de page et visionneuse réutilisables.
- `src/data/initialData.ts` : contenu de prévisualisation (pays, catégories, marques et liens).
- `src/services/authService.ts` : frontière de connexion et déconnexion par rôle.
- `src/services/dataContext.tsx` : état partagé et adaptateur de persistance locale.
- `src/types/domain.ts` : contrats TypeScript des entités métier.
- `public/media/` : logos, drapeaux et fiches d’équipe statiques.

Les routes sont séparées par rôle : `/partners/login` mène à `/partners`, tandis que `/admin/login` mène à `/admin`. Les sections d’administration sont disponibles sous `/admin/partners`, `/admin/countries`, `/admin/team` et `/admin/activity`.

## Mode aperçu et API Laravel

Sans `VITE_API_BASE_URL`, le frontend fonctionne en aperçu local :

- Partenaire : clé d’accès `AniekPartner2024!`.
- Administrateur : `admin@aniek.com` / `AniekAdmin2024!`.

Ces identifiants d’aperçu ne protègent pas les comptes et ne doivent pas être déployés. Les modifications restent dans le navigateur. Le backend Laravel actuel utilise une clé partenaire partagée, sans compte email partenaire.

Pour connecter le frontend, configurez `VITE_API_BASE_URL` sans suffixe `/api/v1`, par exemple dans `frontend/.env.local` :

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Avec cette variable, l’authentification et les données locales de démonstration sont désactivées. Les endpoints utilisés sont `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/partners/access`, `GET /api/v1/partners`, `GET /api/v1/partners/categories`, `GET /api/v1/countries` et `GET /api/v1/team-sheets`. Les opérations d’administration utilisent les routes sous `/api/v1/admin/*` avec le jeton Bearer renvoyé à la connexion.

Le compte admin doit exister dans la base Laravel. La connexion partenaire envoie la clé sous `access_key`; le jeton retourné donne accès aux routes documents partenaires. Les logos, drapeaux et fiches téléversés nécessitent le stockage public Laravel, notamment `php artisan storage:link`.

### Démarrer le backend sous Windows

Le backend actuel requiert PHP 8.3 ou plus et PostgreSQL. Après installation de ces prérequis, configurez `server/.env` depuis `server/.env.example`, en mettant notamment `DB_HOST=127.0.0.1` et les identifiants de votre PostgreSQL local. Puis :

```powershell
cd server
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Dans un autre terminal, lancez Vite depuis `frontend` avec `npm run dev`. CORS doit autoriser l’origine du frontend, normalement `http://localhost:5173` ou `http://127.0.0.1:5173`.