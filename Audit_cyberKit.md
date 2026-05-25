# Audit CyberKit — État au 25 mai 2026 (mise à jour)

Document de suivi : audit initial, durcissement sécurité, contact / Resend, admin messages, retrait chatbot, a11y, progression ressources, durcissement IA (S1), typage admin (A2), charte `DESIGN.md`, aperçu ressources, correctifs admin CMS, vouvoiement IA.

**Projet :** application gratuite de sensibilisation cybersécurité (indépendants & TPE belges)  
**Stack :** React 18, Vite 6, Tailwind, Supabase, Vercel  
**Production :** [https://www.cyberkit.be](https://www.cyberkit.be)  
**Branche de référence :** `main` (commit récent : `90aa938`)

---

## PARTIE 1 — Vue d’ensemble

CyberKit est une SPA adaptée à son périmètre : diagnostic quiz, bibliothèque de ressources, admin CMS, formulaire contact + notification email vers beForensic. Modèle **100 % gratuit in-app** ; l’offre payante passe par **Contact** et **À propos**.

**Points forts actuels**

- React Router, cache catalogue (`CatalogContext`)
- RLS admin (`is_cyberkit_admin()`, `grant_cyberkit_admin.sql`)
- Quiz + `generate-analysis` + infobulles `explain-keyword`
- Contact : `submit-contact` (anti-spam) + enregistrement BDD + **email Resend** → `contact@beforensic.be` (expéditeur `noreply@beforensic.be`)
- Admin : onglet **Messages** (`ContactMessagesPanel`, RPC `admin_list_contact_messages`)
- Edge Functions IA : JWT Supabase, CORS `cyberkit.be`, rate limit IP + plafond global (`aiAccess.ts`, `edge_rate_limits`)
- Progression ressources persistée (`ProgressContext` + `localStorage`)
- Accessibilité de base (skip link, ARIA quiz/contact, tooltips clavier)
- Headers sécurité dans `vercel.json` (CSP, X-Frame-Options, etc.)
- Charte : accents `brand-orange` harmonisés sur Home / résultats / CoachCallout / succès contact
- Nav publique sans lien Admin ; CTA contact (`ContactCtaBanner`)
- Typage admin : `ResourceKind`, types partagés (`supabase.ts`), `npm run typecheck` OK (A2)
- Bibliothèque : modal **Aperçu** avant téléchargement (`ResourcePreviewModal`), bouton orange, description complète + tags
- Vignettes : colonne `preview_image_url`, upload admin, affichage carte + modal ; repli image pour infographies (`ResourcePreviewMedia`)
- Admin CMS : sauvegarde description corrigée (payload sans `slug`, sans `type` invalide à l’update) ; `is_cyberkit_admin()` lit `auth.users` + RPC `admin_check_access`
- IA : prompts centralisés (`aiPrompts.ts`), **vouvoiement obligatoire** ; tooltips mots-clés agrandis (portail, scroll, anti-clipping)

**Fragilités restantes**

- Double thème dark (accueil, quiz) / light (ressources, contact) — assumé ou documenté dans `DESIGN.md`
- PDF / guides : pas de génération auto de vignette — upload manuel `preview_image_url` en admin
- Tutoiement IA : atténué par prompt ; pas de filtre post-réponse systématique

**Maturité globale :** bonne pour un outil pédagogique ; sécurité, contact et parcours ressources **nettement renforcés** ; dette limitée au design system optionnel (`src/ui/`).

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
| Edge Functions IA (S1) | **Corrigé** | JWT (`verify_jwt` + `aiAccess.ts`), CORS strict, rate limit IP + global 24 h, fail-closed — **déployé** prod |
| Dépendances npm | **Corrigé** | `npm audit fix`, Vite 6.4.2, 0 vulnérabilité (`53e01e2`) |
| Headers HTTP | **Corrigé** | `vercel.json` |
| Admin nav publique | **Corrigé** | `Navigation.tsx` |
| Lecture `chat_logs` anon | **Corrigé** | admin seul (`20260525120000`) |

**S1 — détail Edge Functions IA**

| Champ | Détail |
|-------|--------|
| **Plafonds** | Analyse : 5/h et 120/j (global) · Mots-clés : 20/h et 400/j (global) |
| **Fichiers** | `supabase/functions/_shared/aiAccess.ts`, `generate-analysis/`, `explain-keyword/`, `config.toml` |
| **Risque résiduel** | Plafond de dépense + suivi Usage/Cost dans la console Anthropic (clé API nommée `SecuriCoach-Prod`, héritage SecuriCoach) |

**Prérequis admin :** `supabase/scripts/grant_cyberkit_admin.sql` → `app_metadata.role = "admin"` ; migration `20260525210000` (`is_cyberkit_admin` lit aussi `auth.users`) ; bannière + RPC `admin_check_access` dans `/admin` ; **déconnexion / reconnexion** recommandée après grant.

### Problèmes encore ouverts

#### S2 — `company_members` (si réactivation entreprise)

| Criticité | **Faible** — tables retirées en prod. |

### Bonnes pratiques en place

- Clés API uniquement en secrets Edge Functions (`ANTHROPIC_API_KEY`, `RESEND_API_KEY`)
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
| Progression ressources (A1) | `ProgressContext` + `localStorage`, badge « Consulté », compteur bibliothèque (`0af5950`) |
| Accessibilité de base (A3) | skip link, focus route, nav ARIA, quiz, contact, ressources, `KeywordTooltip` (`b825314`) |
| Typage admin (A2) | `ResourceKind`, `Session`/`Resource`/`Theme`, plus de `any` admin ; `npm run typecheck` OK (mai 2026) |
| Aperçu ressources | `ResourcePreviewModal` + CTA Aperçu / titre cliquable ; consultation sans téléchargement (`391c211`, `d979331`) |
| Vignettes ressources | `preview_image_url` + admin upload ; `ResourcePreviewMedia` ; migration `20260525220000` (`8be1cd0`) |
| Admin sauvegarde | Description + payload CMS ; messages d’erreur Supabase (`cd2c470`, `e4dab48`) |
| Tooltips mots-clés | Portail `document.body`, max 400×280px, scroll (`84bd8b0`) |
| Ton IA | Vouvoiement dans `explain-keyword` + `generate-analysis` (`aiPrompts.ts`, `90aa938`) |

---

## PARTIE 4 — Charte graphique

### Existant

- Tokens `brand-orange`, `surface-*`, `.page-dark` / `.page-light`
- Succès contact et CoachCallout alignés sur **brand-orange** (plus d’`emerald` sur les écrans principaux)

### Restant

| Sujet | Recommandation |
|-------|----------------|
| Dark vs light par route | **Documenté** — `DESIGN.md` (choix assumé, pas d’unification) |
| Rayons variables | Mini design system (`Button`, `Card`) optionnel — voir `DESIGN.md` §3 |
| `DESIGN.md` | **Fait** — palette, modes, checklist nouvelle page |

---

## PARTIE 5 — Plan d’amélioration (restant)

### Quick wins — terminés

| Action | Effort | Statut |
|--------|--------|--------|
| `npm audit fix` | 0,5 j | **Fait** (`53e01e2`) |
| Supprimer Edge Function `admin-contact-messages` (doublon RPC) | 0,5 h | **Fait** (`cab9221`, absent dashboard) |
| Nettoyer fonctions obsolètes Supabase (`chat-assistant`, etc.) | 5 min | **Fait** — 3 fonctions actives |
| Secret IA | — | **OK** — `ANTHROPIC_API_KEY` uniquement (pas d’`OPENAI_API_KEY`) |

### Intermédiaire — terminés

| Action | Effort | Statut |
|--------|--------|--------|
| Accessibilité de base | 1–2 j | **Fait** (`b825314`) |
| Persistance `ProgressContext` | 0,5 j | **Fait** (`0af5950`) |
| Renforcer plafonds IA / auth (S1) | 1 j | **Fait** (`c275fec`, déployé prod) |
| Typage admin + `typecheck` (A2) | 0,5–1 j | **Fait** (mai 2026) |
| Aperçu ressource (modal + vignettes) | 1–2 j | **Fait** (`391c211` → `8be1cd0`) |
| Correctifs admin CMS + RLS | 0,5 j | **Fait** (`cd2c470` → `3623ff6`) |
| Tooltips IA lisibles | 0,5 j | **Fait** (`84bd8b0`) |
| Vouvoiement IA | 0,5 h | **Fait** (`90aa938`, fonctions redéployées) |

### Long terme — à faire

| Action | Effort | Statut |
|--------|--------|--------|
| Design system minimal (`src/ui/`) | 3–5 j | À faire (optionnel) |
| Documenter dark/light (`DESIGN.md`) | 0,5 j | **Fait** (mai 2026) |
| Plafond dépense Anthropic + suivi clé `SecuriCoach-Prod` | 15 min | **Fait** (validé ops) |

---

## PARTIE 6 — Tableau de synthèse

| Catégorie | Sujet | Statut |
|-----------|--------|--------|
| Sécurité | RLS CMS / storage | **Fait** |
| Sécurité | Stripe / entreprise | **Retiré** |
| Sécurité | Chatbot / chat-assistant | **Retiré** (repo + dashboard) |
| Sécurité | Anti-spam + submit-contact | **Fait** |
| Sécurité | JWT + CORS + rate limit IA (S1) | **Fait** (repo + prod) |
| Sécurité | npm audit / Vite 6 | **Fait** |
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
| A11y | ARIA / clavier (base) | **Fait** |
| Charte | Dark/light | **Documenté** (`DESIGN.md`) |
| Charte | `DESIGN.md` | **Fait** |
| Typage | Admin / typecheck (A2) | **Fait** (`a361ee9`) |
| Produit | Aperçu + vignettes ressources | **Fait** (`8be1cd0`) |
| Admin | Sauvegarde description / preview | **Fait** (`e4dab48`) |
| Admin | RLS `is_cyberkit_admin` + grant | **Fait** (`3623ff6`) |
| UX | Tooltips mots-clés (taille / clipping) | **Fait** (`84bd8b0`) |
| Produit | Ton IA vouvoiement | **Fait** (`90aa938`) |
| Ops | Vérif prod (contact, admin, quiz, IA) | **Fait** |
| Ops | Budget Anthropic | **Fait** (plafond configuré) |

---

## Edge Functions Supabase (état actuel)

| Fonction | Déployée | Utilisée |
|----------|----------|----------|
| `submit-contact` | Oui | Oui — formulaire contact |
| `generate-analysis` | Oui | Oui — résultats quiz |
| `explain-keyword` | Oui | Oui — tags ressources (vouvoiement via `aiPrompts.ts`) |
| `admin-contact-messages` | **Non** (repo + dashboard) | Non — admin via RPC |
| `chat-assistant` | **Non** (repo + dashboard) | Non — retiré |
| `generate-diagnostic-report` | **Non** | Non — retiré |
| `send-contact-email` | **Non** | Supprimée (logique dans `submit-contact` + Resend) |

**Secrets Edge Functions**

| Secret | Usage |
|--------|--------|
| `ANTHROPIC_API_KEY` | IA quiz + mots-clés (console Anthropic : clé **`SecuriCoach-Prod`**) |
| `RESEND_API_KEY` | Email → `contact@beforensic.be` |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto (submit-contact, rate limits) |

**RPC admin (PostgreSQL)**

| Fonction | Usage |
|----------|--------|
| `admin_list_contact_messages()` | Liste messages dans `/admin` |
| `admin_update_contact_message_status()` | Statuts new / read / replied |
| `admin_check_access()` | Vérifie droits admin côté serveur (bannière `/admin`) |

**Fichiers partagés Edge IA**

| Fichier | Rôle |
|---------|------|
| `_shared/aiPrompts.ts` | Consignes ton (vouvoiement, texte brut) pour toutes les fonctions IA |
| `_shared/aiAccess.ts` | JWT, CORS, rate limits |

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
| `63e1890` | Sync audit / README avec état Edge Supabase |
| `b825314` | Accessibilité de base (nav, quiz, contact, ressources, tooltips) |
| `0af5950` | Persistance `ProgressContext` (localStorage) |
| `c275fec` | Durcissement IA S1 (JWT, CORS, rate limits, `aiAccess.ts`) |
| `a361ee9` | Typage admin (A2) : `ResourceKind`, suppression `any`, `typecheck` vert |
| — (mai 2026) | `DESIGN.md` : charte, modes page-dark / page-light, checklist |
| — (mai 2026) | Plafond Anthropic `SecuriCoach-Prod` validé (ops) |
| `391c211` | Modal aperçu ressource avant téléchargement |
| `d979331` | CTA Aperçu orange (primaire sur carte) |
| `cd2c470` | Fix sauvegarde description admin (retrait champ `slug`) |
| `e4dab48` | Fix update admin (type enum + erreurs Supabase lisibles) |
| `3623ff6` | `is_cyberkit_admin` via `auth.users` + `admin_check_access` |
| `8be1cd0` | `preview_image_url` + vignettes bibliothèque |
| `84bd8b0` | Tooltips mots-clés agrandis (portail, anti-clipping) |
| `90aa938` | Vouvoiement IA (`aiPrompts.ts`), cache tooltips `v2-formal` |

**Migrations clés :** `20260525120000`, `20260525140000`, `20260525180000`, `20260525190000`, `20260525200000`, `20260525210000`, `20260525220000`

---

## Prochaines étapes suggérées

1. **Optionnel — design system** (`src/ui/`) : `Button` + `Card` avec rayons unifiés — seulement si plusieurs écrans sont refondus en même temps (voir `DESIGN.md` §6).
2. **Contenu** : renseigner `preview_image_url` (ou descriptions) pour les ressources existantes — surtout infographies (~65 fiches).
3. **Optionnel — PDF** : génération auto de vignette 1re page (hors scope actuel ; upload manuel en admin).

**Validé (ne plus traiter comme ouvert) :** vérif prod ; typage admin (A2) ; plafond Anthropic ; documentation charte ; aperçu ressources ; correctifs admin CMS ; tooltips IA ; vouvoiement IA (prompt + déploiement fonctions).

**Edge Functions en prod (project-ref `bzxzxzmxiqvnhmlcwqre`, mai 2026) :** `submit-contact`, `generate-analysis`, `explain-keyword` uniquement.
