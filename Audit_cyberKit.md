# Audit CyberKit — État au 25 mai 2026 (mise à jour)

Document de suivi : audit initial, durcissement sécurité, contact / Resend, admin messages, retrait chatbot.

**Projet :** application gratuite de sensibilisation cybersécurité (indépendants & TPE belges)  
**Stack :** React 18, Vite, Tailwind, Supabase, Vercel  
**Production :** [https://www.cyberkit.be](https://www.cyberkit.be)  
**Branche de référence :** `main` (commit récent : `d4ce274`)

---

## PARTIE 1 — Vue d’ensemble

CyberKit est une SPA adaptée à son périmètre : diagnostic quiz, bibliothèque de ressources, admin CMS, formulaire contact + notification email vers beForensic. Modèle **100 % gratuit in-app** ; l’offre payante passe par **Contact** et **À propos**.

**Points forts actuels**

- React Router, cache catalogue (`CatalogContext`)
- RLS admin (`is_cyberkit_admin()`, `grant_cyberkit_admin.sql`)
- Quiz + `generate-analysis` + infobulles `explain-keyword`
- Contact : `submit-contact` (anti-spam) + enregistrement BDD + **email Resend** → `contact@beforensic.be` (expéditeur `noreply@beforensic.be`)
- Admin : onglet **Messages** (`ContactMessagesPanel`, RPC `admin_list_contact_messages`)
- Edge Functions IA : CORS limité à `cyberkit.be` + rate limiting (`edge_rate_limits`)
- Headers sécurité dans `vercel.json` (CSP, X-Frame-Options, etc.)
- Charte : accents `brand-orange` harmonisés sur Home / résultats / CoachCallout / succès contact
- Nav publique sans lien Admin ; CTA contact (`ContactCtaBanner`)

**Fragilités restantes**

- Double thème dark (accueil, quiz) / light (ressources, contact) — assumé ou à documenter

**Maturité globale :** bonne pour un outil pédagogique ; sécurité et contact **nettement renforcés** ; dette limitée à UX secondaire et polish.

---

## PARTIE 2 — Audit sécurité

### Corrigé en production

| Sujet | Statut | Référence |
|-------|--------|-----------|
| Écriture CMS / storage en `anon` | **Corrigé** | `20260525120000_harden_rls_single_admin.sql` |
| Entreprise / Stripe | **Retiré** | `20260525140000_remove_enterprise_and_subscriptions.sql` |
| Chatbot + `chat-assistant` | **Retiré** | code + INSERT `chat_logs` anon supprimé (`20260525180000`) |
| Contact INSERT direct `anon` | **Corrigé** | `submit-contact` + RLS (`20260525180000`) |
| Anti-spam contact | **Corrigé** | honeypot, délai 3 s, rate limit 3/h/IP |
| Email contact | **Corrigé** | Resend, domaine `beforensic.be`, `RESEND_API_KEY` |
| Edge Functions IA ouvertes | **Partiellement corrigé** | CORS + rate limit (`_shared/cors.ts`, `rateLimit.ts`) |
| Headers HTTP | **Corrigé** | `vercel.json` |
| Admin nav publique | **Corrigé** | `Navigation.tsx` |
| Lecture `chat_logs` anon | **Corrigé** | admin seul (`20260525120000`) |

**Prérequis admin :** `supabase/scripts/grant_cyberkit_admin.sql` → `app_metadata.role = "admin"` → **déconnexion / reconnexion** sur `/admin` (ne pas utiliser `refreshSession()` en boucle).

### Problèmes encore ouverts

#### S1 — Edge Functions IA : pas de JWT obligatoire

| Champ | Détail |
|-------|--------|
| **État** | `generate-analysis` et `explain-keyword` : CORS restreint + rate limit (10/h et 30/h par IP). |
| **Risque résiduel** | Abus possible sous le plafond ; alertes coût Anthropic recommandées. |
| **Criticité** | **Moyen** (était élevé) |
| **Fichiers** | `supabase/functions/generate-analysis/`, `explain-keyword/` |

#### S2 — `company_members` (si réactivation entreprise)

| Criticité | **Faible** — tables retirées en prod. |

#### S3 — Dépendances npm

| Criticité | **Faible à moyen** — `npm audit fix` périodique. |

### Bonnes pratiques en place

- Clés API uniquement en secrets Edge Functions
- `supabase/.temp/` ignoré par git (plus de pollution du working tree)
- Pas de `dangerouslySetInnerHTML`
- Contact : double archivage (BDD + email)

---

## PARTIE 3 — Architecture front-end

### Corrigé

| Sujet | Détail |
|-------|--------|
| Routage, catalogue, quiz `label:text` | inchangé, opérationnel |
| Analyse IA résultats | `AIAnalysis` → `generate-analysis` |
| Contact | `Contact.tsx` → `submit-contact` |
| Admin messages | `ContactMessagesPanel` + RPC |
| Admin session | plus de boucle déconnexion (`refreshSession` retiré) |
| Code mort | `ChatBot`, `ChatbotAnalytics`, `ExportProject`, `chat-assistant`, `send-contact-email` **supprimés** |

### Encore à traiter

#### A1 — Progression ressources

| Fichier | `src/contexts/ProgressContext.tsx` |
| Impact | — |
| Statut | **Fait** — `localStorage` (`cyberkit_consulted_resources`), badge « Consulté », compteur bibliothèque |

#### A2 — Typage

- `any` dans `Admin.tsx` ; `npm run typecheck` avec erreurs préexistantes (build Vite OK)

#### A3 — Accessibilité

- **Base faite** : skip link, focus route, nav ARIA, quiz (`progressbar`, `radiogroup`, live regions), contact (`htmlFor`/`id`), ressources (recherche, filtres), `KeywordTooltip` clavier + `role="tooltip"`, `prefers-reduced-motion`

---

## PARTIE 4 — Charte graphique

### Existant

- Tokens `brand-orange`, `surface-*`, `.page-dark` / `.page-light`
- Succès contact et CoachCallout alignés sur **brand-orange** (plus d’`emerald` sur les écrans principaux)

### Restant

| Sujet | Recommandation |
|-------|----------------|
| Dark vs light par route | Documenter le choix « marketing / lecture » ou unifier |
| Rayons variables | Mini design system (`Button`, `Card`) optionnel |
| `DESIGN.md` | Palette + 2 modes de page |

---

## PARTIE 5 — Plan d’amélioration (restant)

### Quick wins

| Action | Effort | Statut |
|--------|--------|--------|
| `npm audit fix` | 0,5 j | **Fait** (`53e01e2`) |
| Supprimer Edge Function `admin-contact-messages` (doublon RPC) | 0,5 h | **Fait** (repo `cab9221`) — absente du dashboard (vérif. CLI mai 2026) |
| Nettoyer fonctions obsolètes Supabase (`chat-assistant`, etc.) | 5 min | **Fait** — prod : 3 fonctions actives uniquement (vérif. CLI) |
| Secret IA | — | **OK** — prod : `ANTHROPIC_API_KEY` uniquement (`generate-analysis`, `explain-keyword`). Pas de `OPENAI_API_KEY` côté Supabase. |

### Intermédiaire

| Action | Effort |
|--------|--------|
| Accessibilité de base | 1–2 j | **Fait** (base : nav, quiz, contact, ressources, tooltips) |
| Persistance `ProgressContext` | 0,5 j | **Fait** |
| Renforcer plafonds IA ou auth optionnelle | 1 j |

### Long terme

| Action | Effort |
|--------|--------|
| Design system minimal (`src/ui/`) | 3–5 j |
| Documenter ou unifier dark/light | 3–5 j |

---

## PARTIE 6 — Tableau de synthèse

| Catégorie | Sujet | Statut |
|-----------|--------|--------|
| Sécurité | RLS CMS / storage | **Fait** |
| Sécurité | Stripe / entreprise | **Retiré** |
| Sécurité | Chatbot / chat-assistant | **Retiré** (repo + dashboard) |
| Sécurité | Anti-spam + submit-contact | **Fait** |
| Sécurité | CORS + rate limit IA | **Fait** (partiel) |
| Sécurité | Headers Vercel | **Fait** |
| Produit | Quiz libellés | **Fait** |
| Produit | Email contact Resend | **Fait** |
| UX | CTA contact, admin hors nav | **Fait** |
| UX | explain-keyword | **Fait** |
| Admin | Inbox messages (RPC) | **Fait** |
| Admin | Boucle login | **Fait** |
| Charte | emerald → orange | **Fait** (écrans principaux) |
| Architecture | ChatBot / ExportProject | **Supprimés** |
| Architecture | `admin-contact-messages` Edge | **Supprimée** (RPC seul) |
| Architecture | ProgressContext | **Fait** (localStorage) |
| Charte | Dark/light | **À documenter** |
| A11y | ARIA / clavier (base) | **Fait** |

---

## Edge Functions Supabase (état actuel)

| Fonction | Déployée | Utilisée |
|----------|----------|----------|
| `submit-contact` | Oui | Oui — formulaire contact |
| `generate-analysis` | Oui | Oui — résultats quiz |
| `explain-keyword` | Oui | Oui — tags ressources |
| `admin-contact-messages` | **Non** (repo + dashboard) | Non — admin via RPC (`admin_list_contact_messages`, etc.) |
| `chat-assistant` | **Non** (repo + dashboard) | Non — retiré |
| `generate-diagnostic-report` | **Non** | Non — retiré |
| `send-contact-email` | **Non** | Supprimée (logique dans `submit-contact` + Resend) |

**Secrets Edge Functions**

| Secret | Usage |
|--------|--------|
| `ANTHROPIC_API_KEY` | IA quiz + mots-clés |
| `RESEND_API_KEY` | Email → `contact@beforensic.be` |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto (submit-contact, rate limits) |

**RPC admin (PostgreSQL)**

| Fonction | Usage |
|----------|--------|
| `admin_list_contact_messages()` | Liste messages dans `/admin` |
| `admin_update_contact_message_status()` | Statuts new / read / replied |

---

## Flux contact (référence)

```mermaid
flowchart LR
  A[Formulaire /contact] --> B[submit-contact]
  B --> C[(contact_messages)]
  B --> D[Resend]
  D --> E[contact@beforensic.be]
  C --> F[Admin /admin Messages]
```

---

## Historique des correctifs (session mai 2026)

| Date / commit | Changement |
|---------------|------------|
| `fa706f3` | RLS, retrait entreprise/Stripe, fix quiz |
| `1cad9c5` | CTA contact, admin hors nav, explain-keyword |
| `8d6976a` | Audit document initial |
| `a47603b` | Retrait chatbot, hardening Edge Functions, submit-contact |
| `df04f0c` / `2cad141` | Resend, domaine `beforensic.be` |
| `a18d313` | Inbox messages admin |
| `b79f371` | Fix boucle déconnexion admin |
| `4e6fb2c` | Messages admin via RPC (plus Edge Function côté front) |
| `d4ce274` | `supabase/.temp/` ignoré par git |
| `53e01e2` | `npm audit fix`, Vite 6.4.2, 0 vulnérabilité npm |
| `cab9221` | Suppression `admin-contact-messages` + `adminAuth` (RPC seul) |

**Migrations clés :** `20260525120000`, `20260525140000`, `20260525180000`, `20260525190000`, `20260525200000`

---

## Prochaines étapes suggérées

1. Vérifier en prod : contact (email + ligne BDD), admin Messages, quiz + analyse IA.
2. Choisir la suite : design system, ou durcissement IA (S1) — selon priorité produit.

**Edge Functions en prod (project-ref `bzxzxzmxiqvnhmlcwqre`, mai 2026) :** `submit-contact`, `generate-analysis`, `explain-keyword` uniquement.
