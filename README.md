# CyberKit

Outil **100 % gratuit** de sensibilisation à la cybersécurité pour indépendants et TPE belges : diagnostic, bibliothèque de ressources et assistant pédagogique. Aucun abonnement in-app — l’accompagnement payant (formation, coaching, audit) passe par [beForensic](https://beforensic.be) via la page Contact.

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

## Admin Supabase (un seul compte)

Après la migration `20260525120000_harden_rls_single_admin.sql`, le CMS n’accepte plus les écritures via la clé `anon` : il faut être connecté avec un compte dont `app_metadata.role` vaut `admin`.

1. Exécuter `supabase/scripts/grant_cyberkit_admin.sql` dans le SQL Editor (remplacer l’email).
2. Se déconnecter / reconnecter sur `/admin` pour rafraîchir le JWT.

## Structure utile

- `src/pages/` — pages publiques (accueil, quiz, ressources, etc.)
- `src/contexts/CatalogContext.tsx` — cache partagé thèmes / ressources
- `src/services/catalog.ts` — requêtes Supabase catalogue
- `supabase/functions/` — Edge Functions (emails, IA)
- `supabase/migrations/` — schéma et politiques RLS

## Hors périmètre (retiré)

- Espace entreprise multi-utilisateurs (`companies`, invitations)
- Paiements Stripe / abonnements in-app

Sur Supabase Dashboard → **Edge Functions**, supprimer la fonction obsolète **`generate-diagnostic-report`** (remplacée par `generate-analysis` + le front). Fonctions attendues : `chat-assistant`, `generate-analysis`, et éventuellement `explain-keyword` / `send-contact-email` si vous les déployez.

Edge Functions attendues : `chat-assistant`, `generate-analysis`, `explain-keyword` (infobulles sur les tags des ressources).

```bash
npx supabase@2.101.0 functions deploy generate-analysis --project-ref bzxzxzmxiqvnhmlcwqre
npx supabase@2.101.0 functions deploy explain-keyword --project-ref bzxzxzmxiqvnhmlcwqre
```

L’accès admin reste sur `/admin` (non listé dans la navigation publique).

Puis :

```bash
npx supabase@2.101.0 db push --yes
```

## Licence

Projet privé — © beForensic / Serge Houtain.
