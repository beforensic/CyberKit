# CyberKit

Outil gratuit de sensibilisation à la cybersécurité pour indépendants et TPE belges : diagnostic, bibliothèque de ressources et assistant pédagogique.

Projet initialement démarré avec **Bolt** (`bolt-vite-react-ts`), puis hébergé sur **Vercel** (équipe Beforensic) avec **Supabase** en backend.

## URLs de production

| URL | Usage |
|-----|--------|
| [https://www.cyberkit.be](https://www.cyberkit.be) | Site principal (domaine de production) |
| [https://cyberkit.be](https://cyberkit.be) | Redirige vers `www.cyberkit.be` |
| [https://cyberkit-ten.vercel.app](https://cyberkit-ten.vercel.app) | URL Vercel par défaut du projet |

> **Note :** `https://cyberkit.vercel.app` n’est pas rattaché à ce projet Vercel (sous-domaine déjà pris par un autre déploiement). Utiliser les URLs ci-dessus.

Dashboard déploiement : [vercel.com/beforensics-projects/cyberkit](https://vercel.com/beforensics-projects/cyberkit)

## Développement local

```bash
npm install
# Créer un fichier .env à la racine avec les variables ci-dessous
npm run dev
```

Variables d’environnement requises (également configurées sur Vercel) :

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |

## Stack

- **Frontend :** React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend :** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Hébergement :** Vercel (SPA, rewrites vers `index.html`)

## Structure utile

- `src/pages/` — pages publiques (accueil, quiz, ressources, etc.)
- `src/contexts/CatalogContext.tsx` — cache partagé thèmes / ressources
- `src/services/catalog.ts` — requêtes Supabase catalogue
- `supabase/functions/` — Edge Functions (emails, Stripe, IA, etc.)
- `supabase/migrations/` — schéma et politiques RLS

## Licence

Projet privé — © beForensic / Serge Houtain.
