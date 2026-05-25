# Audit CyberKit — État au 25 mai 2026

Document de suivi après audit initial, correctifs RLS, retrait entreprise/Stripe, et améliorations UX/conversion.

**Projet :** application gratuite de sensibilisation cybersécurité (indépendants & TPE belges)  
**Stack :** React 18, Vite, Tailwind, Supabase, Vercel  
**Production :** [https://www.cyberkit.be](https://www.cyberkit.be)

---

## PARTIE 1 — Vue d’ensemble

CyberKit est une SPA mature pour son périmètre : diagnostic quiz, bibliothèque de ressources, admin CMS, formulaire contact vers beForensic. Le produit est aligné sur un modèle **100 % gratuit in-app**, la conversion payante passant par **Contact** et **À propos**, pas par abonnement Stripe.

**Points forts actuels**

- React Router avec URLs partageables (`/quiz`, `/quiz/resultats`, `/resources`, etc.)
- Cache catalogue (`CatalogContext`, `useThemes`, `useResources`)
- RLS durcie pour l’admin (`is_cyberkit_admin()`, migration `20260525120000`)
- Diagnostic opérationnel (questions via alias `label:text`, résultats + `generate-analysis`)
- Tokens `brand-orange` / `surface-*` dans Tailwind
- CTA contact visibles (`ContactCtaBanner`) ; lien Admin retiré de la nav publique
- Edge Functions déployées : `chat-assistant`, `generate-analysis`, `explain-keyword`

**Fragilités restantes**

- Edge Functions IA toujours appelables publiquement (CORS `*`, pas de rate limit)
- `ChatBot` et `ExportProject` présents dans le code mais non routés
- Double thème visuel dark (accueil/quiz) / light (ressources, contact)
- Accents `emerald` ponctuels hors charte orange
- `ProgressContext` non persisté (perdu au refresh)

**Maturité globale :** bonne pour un outil pédagogique interne ; sécurité backend **nettement améliorée** ; dette limitée au code mort et au durcissement des APIs IA.

---

## PARTIE 2 — Audit sécurité

### Corrigé en production (migrations appliquées)

| Sujet | Statut | Référence |
|-------|--------|-----------|
| Écriture CMS (resources, themes, keywords) ouverte à `anon` | **Corrigé** | `20260525120000_harden_rls_single_admin.sql` |
| Storage bucket `resources` modifiable en `anon` | **Corrigé** | idem |
| Lecture publique table `companies` | **Corrigé** (tables supprimées si présentes) | `20260525140000_remove_enterprise_and_subscriptions.sql` |
| Lecture anonyme `chat_logs` | **Corrigé** (lecture admin uniquement) | `20260525120000` |
| Stripe / checkout / webhook entreprise | **Retiré** du repo | fonctions supprimées |
| Lien Admin dans la navigation publique | **Corrigé** | `src/components/Navigation.tsx` |

**Prérequis admin :** compte Supabase avec `app_metadata.role = "admin"` (script `supabase/scripts/grant_cyberkit_admin.sql`). Reconnexion obligatoire après attribution.

### Problèmes encore ouverts

#### S1 — Edge Functions IA sans auth ni rate limiting

| Champ | Détail |
|-------|--------|
| **Problème** | `chat-assistant`, `generate-analysis`, `explain-keyword` acceptent POST avec clé anon ; CORS `*`. |
| **Risque** | Abus des clés Anthropic/OpenAI, coûts API. |
| **Criticité** | **Élevé** |
| **Fichiers** | `supabase/functions/chat-assistant/index.ts`, `generate-analysis/index.ts`, `explain-keyword/index.ts` |
| **Recommandation** | Rate limiting (IP / session), CORS limité à `https://www.cyberkit.be`, option JWT pour usages sensibles. |

#### S2 — `company_members` encore permissif (si tables réactivées)

| Champ | Détail |
|-------|--------|
| **Problème** | Migrations historiques `allow_*` sur `company_members` pour tout `authenticated`. |
| **Risque** | Faible aujourd’hui (feature entreprise retirée, tables droppées en prod). |
| **Criticité** | **Faible** (hors périmètre produit actuel) |
| **Recommandation** | Ne pas réactiver l’espace entreprise sans repenser les policies. |

#### S3 — Formulaire contact : INSERT direct sans rate limit

| Champ | Détail |
|-------|--------|
| **Problème** | `Contact.tsx` insère dans `contact_messages` ; `send-contact-email` existe mais n’est pas utilisé par le front. |
| **Risque** | Spam en base. |
| **Criticité** | **Moyen** |
| **Fichiers** | `src/pages/Contact.tsx`, RLS `contact_messages` |
| **Recommandation** | Honeypot + rate limit ou passage par Edge Function. |

#### S4 — Absence de headers sécurité HTTP (CSP, etc.)

| Champ | Détail |
|-------|--------|
| **Problème** | `vercel.json` ne définit que des rewrites SPA. |
| **Criticité** | **Faible** |
| **Recommandation** | Ajouter CSP, `X-Frame-Options`, `Referrer-Policy` dans Vercel. |

#### S5 — Dépendances npm (audit)

| Champ | Détail |
|-------|--------|
| **Problème** | Vulnérabilités transitoires (ReDoS, etc.) dans la chaîne de build. |
| **Criticité** | **Faible à moyen** (outil dev) |
| **Recommandation** | `npm audit fix` régulier. |

### Bonnes pratiques en place

- `.env` ignoré par git ; clés API côté Edge Functions uniquement
- Webhook Stripe supprimé (n’était pas déployé)
- `is_cyberkit_admin()` pour CMS, storage, analytics, contact (lecture admin)
- Pas de `dangerouslySetInnerHTML` dans le front

---

## PARTIE 3 — Architecture front-end

### Corrigé

| Sujet | Détail |
|-------|--------|
| Routage React Router | `src/App.tsx`, routes quiz/resultats |
| Cache thèmes/ressources | `CatalogContext`, `src/services/catalog.ts` |
| Quiz questions vides | `src/services/quizQuestions.ts` (alias `label:text`) |
| Analyse IA résultats | `AIAnalysis` → `generate-analysis` + `quizWeakPoints.ts` |
| Upload admin storage | Bucket `resources` dans `ResourceForm.tsx` |
| Entreprise / Stripe | `CompaniesManager` supprimé ; pas de routes `/entreprise` |

### Encore à traiter

#### A1 — Composants orphelins

| Composant | Fichier | Impact |
|-----------|---------|--------|
| Chatbot flottant | `src/components/ChatBot.tsx` | Non monté dans `AppLayout` — feature invisible |
| Export projet | `src/pages/ExportProject.tsx` | Non routé |
| Progression ressources | `src/contexts/ProgressContext.tsx` | État perdu au refresh |

**Recommandation :** monter `ChatBot` dans `AppLayout` ou supprimer ; supprimer `ExportProject` ou ajouter route ; persister `ProgressContext` en `localStorage` si utile.

#### A2 — Typage et dette mineure

- `any` dans `Admin.tsx`, formulaires admin
- `npm run typecheck` échoue sur imports/typos préexistants (non bloquant au build Vite)

#### A3 — Accessibilité

- Peu ou pas d’attributs ARIA sur navigation, modales, tooltips
- Tooltips mots-clés : survol souris OK, à valider au clavier / mobile

#### A4 — `send-contact-email` non branché

- Fonction déployée possiblement absente ; le contact utilise l’INSERT Supabase direct

---

## PARTIE 4 — Charte graphique / design system

### Existant

- Tokens : `brand-orange`, `surface-dark`, `surface-light` (`tailwind.config.js`, `index.css`)
- Classes utilitaires : `.page-dark`, `.page-light`, `.glass-card`, `.text-gradient`
- Marque **CyberKit** unifiée sur l’UI principale (PDF / AudioPlayer corrigés)

### Incohérences restantes

| Sujet | Où | Recommandation |
|-------|-----|----------------|
| Dark vs light par route | `AppLayout.tsx` (`/`, `/quiz` dark ; reste light) | Assumer le split « marketing / outil » ou unifier |
| Accents `emerald` | `Home.tsx`, `QuizResults.tsx`, `CoachCallout.tsx` | Remplacer par `brand-orange` / slate |
| Rayons / espacements variables | `rounded-2xl` vs `rounded-[2.5rem]` | Mini design system (`Button`, `Card`) |
| Contact succès en `green-*` | `Contact.tsx` | Aligner sur `brand-orange` |

### Mini design system suggéré

- Composants : `Button`, `Card`, `Badge`, `ContactCtaBanner` (déjà créé)
- Document court `DESIGN.md` : palette, rayons, 2 modes de page

---

## PARTIE 5 — Plan d’amélioration priorisé (restant)

### Quick wins (1–3 jours)

| Action | Objectif | Zone |
|--------|----------|------|
| Monter ou supprimer `ChatBot` | Feature assistant visible ou code mort retiré | `AppLayout.tsx` |
| Remplacer `emerald` par `brand-orange` | Cohérence visuelle | `Home.tsx`, `QuizResults.tsx` |
| `npm audit fix` | Réduire CVE build | `package.json` |
| Headers sécurité Vercel | Durcissement navigateur | `vercel.json` |

### Intermédiaire (1–2 semaines)

| Action | Objectif | Zone |
|--------|----------|------|
| Rate limit + CORS Edge Functions IA | Limiter abus API | `supabase/functions/*` |
| Anti-spam contact | Réduire spam formulaire | `Contact.tsx` ou Edge Function |
| Supprimer `ExportProject` ou l’intégrer | Réduire dette | `src/pages/` |
| Accessibilité de base | ARIA, focus visible | Navigation, quiz, tooltips |

### Long terme

| Action | Objectif | Zone |
|--------|----------|------|
| Design system minimal | Maintenabilité UI | `src/ui/` |
| Persistance progression | UX parcours ressources | `ProgressContext` |
| Admin via Edge Functions + service role | Supprimer toute écriture CMS côté client | Backend + admin |

---

## PARTIE 6 — Tableau de synthèse

| Catégorie | Problème | Impact | Priorité | Recommandation | Effort |
|-----------|----------|--------|----------|----------------|--------|
| Sécurité | Edge Functions IA ouvertes | Coûts API | P0 | Rate limit + CORS | 2–3 j |
| Sécurité | Spam contact | Pollution DB | P2 | Honeypot / Edge Function | 1 j |
| Sécurité | Pas de CSP | XSS amplifié | P3 | Headers Vercel | 0,5 j |
| Architecture | ChatBot non monté | Feature absente | P1 | Intégrer ou supprimer | 1 h |
| Architecture | ExportProject orphelin | Dette | P3 | Supprimer ou router | 0,5 j |
| Architecture | ProgressContext volatile | UX | P3 | localStorage | 0,5 j |
| UX/UI | CTA contact | Conversion beForensic | — | **Fait** (`ContactCtaBanner`) | — |
| UX/UI | Admin hors nav | Surface attaque | — | **Fait** | — |
| UX/UI | explain-keyword | Tags ressources | — | **Fait** (déployé + ResourceCard) | — |
| Charte | emerald hors palette | Incohérence | P2 | Tokens succès | 1 j |
| Charte | Dark/light mixte | 2 univers | P3 | Documenter ou unifier | 3–5 j |
| Sécurité | RLS CMS anon | Défacement | — | **Fait** (migration RLS) | — |
| Sécurité | Stripe / entreprise | Complexité | — | **Retiré** | — |
| Produit | Quiz sans libellé | Bloquant | — | **Fait** (`label:text`) | — |

---

## Edge Functions Supabase (état actuel)

| Fonction | Déployée | Utilisée par le front |
|----------|----------|------------------------|
| `chat-assistant` | Oui | Non (ChatBot non monté) ; admin analytics lecture logs |
| `generate-analysis` | Oui | Oui (`AIAnalysis.tsx`) |
| `explain-keyword` | Oui | Oui (`KeywordTooltip` sur tags ressources) |
| `send-contact-email` | À vérifier | Non (INSERT direct) |
| `create-checkout-session` | Non | Supprimée du repo |
| `stripe-webhook` | Non | Supprimée du repo |
| `generate-diagnostic-report` | Supprimée | Remplacée par `generate-analysis` |

**Secrets attendus :** `ANTHROPIC_API_KEY` (et éventuellement `OPENAI_API_KEY` pour `chat-assistant`).

---

## Questions à clarifier

1. Souhaitez-vous réactiver le **chatbot flottant** sur toutes les pages ou uniquement sur `/resources` ?
2. Faut-il brancher **`send-contact-email`** (Resend) à la place de l’INSERT Supabase ?
3. Le **double thème** dark/light est-il voulu (accueil premium / outil lecture) ou temporaire ?

---

## Historique des correctifs (cette session)

- `20260525120000_harden_rls_single_admin.sql` — RLS admin
- `20260525140000_remove_enterprise_and_subscriptions.sql` — retrait schéma entreprise
- Quiz : `quizQuestions.ts`, `getQuestionLabel` / alias `label:text`
- `AIAnalysis` → `generate-analysis`
- `ContactCtaBanner`, nav sans Admin, `explain-keyword` déployé
- Commits : `fa706f3`, `1cad9c5` sur `main`
