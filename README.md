# CyberKit

Outil **100 % gratuit** de sensibilisation à la cybersécurité pour indépendants et TPE belges : diagnostic, bibliothèque de ressources et infobulles IA sur les mots-clés. Aucun abonnement in-app — l’accompagnement payant (formation, coaching, audit) passe par [beForensic](https://beforensic.be) via la page Contact.

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

**Edge Functions en production** (project-ref `bzxzxzmxiqvnhmlcwqre`) — uniquement :


| Fonction | Rôle |
|----------|------|
| `submit-contact` | Formulaire contact (anti-spam, rate limit) |
| `generate-analysis` | Analyse IA des résultats quiz |
| `explain-keyword` | Infobulles sur les tags ressources |

**Protection IA** (`generate-analysis`, `explain-keyword`) :

- `verify_jwt = true` (JWT Supabase obligatoire, anon ou session)
- CORS : origines `cyberkit.be` + localhost dev uniquement
- Rate limit par IP : 5/h (analyse), 20/h (mots-clés)
- Plafond global : 120 analyses / 400 infobulles par jour
- En cas d’erreur du store rate limit : refus (fail-closed)

Configurer une alerte de budget sur le compte **Anthropic** (recommandé).

Déploiement (project-ref `bzxzxzmxiqvnhmlcwqre`) :

```bash
npx supabase@2.101.0 db push --yes
npx supabase@2.101.0 functions deploy submit-contact --project-ref bzxzxzmxiqvnhmlcwqre
npx supabase@2.101.0 functions deploy generate-analysis --project-ref bzxzxzmxiqvnhmlcwqre
npx supabase@2.101.0 functions deploy explain-keyword --project-ref bzxzxzmxiqvnhmlcwqre
```

Secrets Edge Functions :

| Secret | Usage |
|--------|--------|
| `ANTHROPIC_API_KEY` | Analyse quiz et infobulles mots-clés |
| `RESEND_API_KEY` | Notification email à chaque message contact (`contact@beforensic.be`) |
| `CONTACT_NOTIFY_EMAIL` | (optionnel) Destinataire, défaut `contact@beforensic.be` |

`SUPABASE_SERVICE_ROLE_KEY` est injecté automatiquement par Supabase.

Configurer `RESEND_API_KEY` : Supabase Dashboard → Project Settings → Edge Functions → Secrets.

L’accès admin reste sur `/admin` (non listé dans la navigation publique).

## Licence

Projet privé — © beForensic / Serge Houtain.
