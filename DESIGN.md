---
name: CyberKit
description: Diagnostic cyber gratuit pour indépendants et TPE belges — double mode marketing sombre / lecture claire.
colors:
  brand-orange: "#E8650A"
  brand-orange-50: "#FEF3EC"
  brand-orange-100: "#FDE8D7"
  brand-orange-200: "#FBCFAD"
  brand-orange-300: "#F7A872"
  brand-orange-400: "#F08040"
  brand-orange-600: "#C95508"
  brand-orange-700: "#A84406"
  brand-orange-800: "#873504"
  brand-orange-900: "#5D2608"
  accent-rose: "#e11d48"
  surface-dark: "#0F172A"
  surface-light: "#FAFAFA"
  surface-deep: "#020617"
  slate-900: "#0f172a"
  slate-800: "#1e293b"
  slate-700: "#334155"
  slate-500: "#64748b"
  slate-400: "#94a3b8"
  slate-300: "#cbd5e1"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(3rem, 8vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "-0.025em"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  xl: "0.75rem"
  2xl: "1rem"
  card: "1.5rem"
  panel: "2rem"
spacing:
  section-y: "4rem"
  page-x: "1rem"
  stack: "1.5rem"
  card-pad: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-orange}"
    textColor: "{colors.white}"
    rounded: "{rounded.2xl}"
    padding: "1rem 2rem"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "{colors.brand-orange-600}"
    textColor: "{colors.white}"
    rounded: "{rounded.2xl}"
    padding: "1rem 2rem"
  button-secondary-dark:
    backgroundColor: "rgba(30, 41, 59, 0.4)"
    textColor: "{colors.slate-300}"
    rounded: "{rounded.2xl}"
    padding: "1rem 2rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.slate-400}"
    rounded: "{rounded.2xl}"
    padding: "1rem 2rem"
  card-dark:
    backgroundColor: "rgba(30, 41, 59, 0.4)"
    textColor: "{colors.slate-300}"
    rounded: "{rounded.panel}"
    padding: "{spacing.card-pad}"
  card-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.slate-900}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  input-field:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.slate-900}"
    rounded: "{rounded.2xl}"
    padding: "1rem"
  nav-tab-active:
    backgroundColor: "{colors.brand-orange-50}"
    textColor: "{colors.brand-orange}"
    rounded: "{rounded.xl}"
    padding: "0.25rem"
---

# Design System: CyberKit

## Overview

**Creative North Star: "La Lanterne double"**

CyberKit porte une flamme unique — la braise beForensic — dans deux chambres : une salle sombre pour accrocher et accompagner le diagnostic, une salle claire pour lire, choisir et remplir. Même orange, même Inter, même générosité de rayon ; densité et contraste changent avec le job de la page.

Le système est **direct, rassurant, contrasté**. Il parle aux indépendants et TPE belges non-technophiles : titres lourds et lisibles, CTA orange décisifs, surfaces sobres. Pas de théâtre cyber ; de la clarté de terrain.

**Anti-références confirmées :** purple-on-white / indigo SaaS générique ; néon cyberpunk ; glassmorphism lourd et flou omniprésent ; emerald comme accent de succès sur les parcours principaux.

**Key Characteristics:**
- Double mode page : `.page-dark` (marketing / quiz) vs `.page-light` (lecture / formulaires)
- Accent unique : braise beForensic (`#E8650A`) pour actions et états positifs
- Rayons généreux : `card` 1.5rem, `panel` 2rem, boutons `2xl`
- Inter forcé globalement ; titres marketing souvent `font-black`
- Nav principale en barre fixe bas d’écran (mobile-first)
- Admin hors charte publique : `slate-50` + sidebar `slate-900`

## Colors

Palette courte : une braise d’action, un rose de dégradé rare, deux surfaces de mode, une échelle slate pour texte et bordures.

### Primary
- **Braise beForensic** (`#E8650A`) : CTA, liens actifs, badges, focus ring, halos marketing. Échelle Tailwind `brand-orange-50`…`900` pour fonds légers, hovers et texte sur fond clair (`600` = hover CTA).

### Secondary
- **Rose de flamme** (`#e11d48`) : uniquement dans `.text-gradient` (orange → rose). Pas d’usage comme CTA ni état système.

### Neutral
- **Ardoise nuit** (`#0F172A` / `surface-dark`) : fond pages marketing et quiz.
- **Nuit profonde** (`#020617` / `surface-deep`) : accents très sombres / variables CSS.
- **Papier atelier** (`#FAFAFA` / `surface-light`) : fond pages lecture + `body` par défaut.
- **Blanc carte** (`#ffffff`) : cartes et formulaires en mode light.
- **Slate texte** (`#64748b` / `#94a3b8` / `#cbd5e1` / `#1e293b`) : hiérarchie de texte et bordures selon le mode.

### Named Rules
**The One Flame Rule.** Un seul accent d’action : `brand-orange`. Pas d’emerald (ni autre vert succès) sur contact, coach, résultats ou CTA principaux.

**The Dual Chamber Rule.** Marketing / diagnostic → `.page-dark` + cartes glass / `surface-card-dark`. Lecture / formulaires / catalogue → `.page-light` + cartes blanches. Ne pas unifier globalement sans décision métier.

## Typography

**Display Font:** Inter (system-ui, sans-serif)  
**Body Font:** Inter (system-ui, sans-serif)

**Character:** Une seule famille, forcée en `!important` sur titres et corps. La hiérarchie passe par le poids (`font-black` / `font-bold`) et le tracking, pas par un second caractère.

### Hierarchy
- **Display** (900, `clamp(3rem, 8vw, 4.5rem)`, lh 1.05) : hero Accueil — impact marketing.
- **Headline** (900, `~1.875–2.25rem`) : sections et titres de page.
- **Title** (700, `1.25rem`) : titres de cartes, modules.
- **Body** (400, `1–1.125rem`, lh relaxed) : paragraphes ; slate-400/500 dark, slate-600/700 light. Max utile ~max-w-2xl / 65–75ch.
- **Label** (900, `10px`, uppercase, tracking-widest) : chips, eyebrow « Accompagnement beForensic », badges type ressource.

### Named Rules
**The Single Face Rule.** Pas de serif display ni de mono UI hors code admin. Inter partout ; la personnalité vient du poids et du contraste de mode.

## Layout

Mobile-first. Conteneurs récurrents : `max-w-6xl` (home / thèmes), `max-w-5xl` (about), `max-w-4xl` / `max-w-3xl` (quiz, legal), `max-w-2xl` (nav bottom). Padding horizontal `px-4` / `px-6`. Sections marketing avec grands gaps (`mb-32`, `py-16`–`32`).

La navigation fixe bas utilise `.nav-dock` (safe-area bottom/left/right) et des cibles ≥44px. Le footer AppLayout utilise `.footer-with-nav` pour dégager la barre + encoche. Viewport : `viewport-fit=cover`.

Densité marketing : aérée avec halos soft. Densité lecture : cartes empilées, plus de texte par viewport. Sur téléphone, les CTA hero Home passent en colonne pleine largeur (`flex-col` → `sm:flex-row`).

Breakpoints Tailwind standards (`sm`, `md`, `lg`) : colonnes 1 → 2 → 3 sur grilles thèmes / ressources.

### Named Rules
**The Bottom Dock Rule.** La nav publique vit en bas d’écran. Ne pas la déplacer en top bar sans refonte explicitement demandée.

## Elevation & Depth

Hybride. En dark : profondeur surtout **tonale** (slate-800/40–50, bordures slate-700/40–50) + halos orange flous décoratifs, pas de stack d’ombres lourdes. En light : cartes blanches avec `shadow-sm` au repos, `shadow-xl` + teinte orange faible au hover. CTA : `shadow-brand-orange/20–25` ; `.btn-glow` ajoute un halo `0 0 20px rgb(232 101 10 / 0.4)` + léger scale.

### Shadow Vocabulary
- **Card rest (light)** (`shadow-sm`) : cartes ressources au repos.
- **Card hover (light)** (`shadow-xl` + `shadow-brand-orange/5`) : lift au survol.
- **CTA lift** (`shadow-xl shadow-brand-orange/25`) : boutons contact / primary.
- **Nav dock dark** (`0 -4px 24px rgba(0,0,0,0.35)`) : barre bas en mode sombre.
- **Nav dock light** (`0 -4px 12px rgba(0,0,0,0.05)`) : barre bas en mode clair.
- **CTA glow** (`0 0 20px rgb(232 101 10 / 0.4)`) : hover `.btn-glow` uniquement.

### Named Rules
**The Flat-By-Default Rule.** Surfaces dark plates (bordure + opacité). Ombres structurelles réservées au mode light et aux CTA ; le glow orange est un état, pas un décor permanent.

## Shapes

Forme **généreuse et amicale** : coins larges, silhouettes de panneau plutôt que de carte fine. `rounded-2xl` (1rem) boutons / champs / pastilles ; `rounded-card` (1.5rem) cartes ressources ; `rounded-panel` (2rem) panneaux quiz, bannières CTA, blocs hero secondaires. Chips / badges souvent `rounded-full` ou `rounded-xl`. Favoris : bouton circulaire.

Bordures : dark `border-slate-700/40–50` ; light `border-slate-100` ; accents CTA `border-brand-orange/20–30`.

### Named Rules
**The Soft Shell Rule.** Préférer `card` / `panel` aux petits rayons (4–8px) sur surfaces produit. Les coins serrés restent admin ou micro-contrôles.

## Components

Caractère global : **confiant et pédagogique** — grands hit targets, orange décisif, peu de variants.

### Buttons
- **Shape:** `rounded-2xl` (1rem) ; parfois `rounded-xl` sur quiz court.
- **Primary:** fond `brand-orange`, texte blanc, `font-bold` / `font-black`, padding ~`px-8 py-4`. Hover → `brand-orange-600` ; option `.btn-glow`.
- **Secondary (dark):** `bg-slate-800/40` + bordure slate ; texte slate-200.
- **Ghost / text:** underline ou texte slate, pas de fond.
- **Focus:** toujours `.focus-ring` (ring orange + offset).

### Chips
- **Style:** pastilles `rounded-full` / `rounded-xl` ; fond `brand-orange/5–10` + bordure `brand-orange/10–20` en dark ; `brand-orange-50` en light.
- **Label:** uppercase 10px tracking-widest, texte orange.

### Cards / Containers
- **Dark:** `.surface-card-dark` ou `.glass-card` — fond slate translucide, bordure discrète, `rounded-panel`.
- **Light:** blanc, `rounded-card`, `border-slate-100`, ombre soft.
- **CTA banner:** `rounded-panel`, bordure teintée orange, halo blur optionnel en dark.
- **Internal padding:** souvent `p-6`–`p-8` (card) ou `p-8 md:p-10` (panel).

### Inputs / Fields
- **Style:** fond `slate-50` / surface light, `rounded-2xl`, souvent sans bordure forte (`border-none`).
- **Focus:** `focus-ring` ou `ring-2 ring-brand-orange/20`.
- **Error:** fond / texte rouge soft (`red-50` / `red-700`) — admin et contact.

### Navigation
- Barre fixe bas, max-w-2xl, 6 items icône + label 10px.
- Actif : texte `brand-orange` + pastille fond orange soft.
- Contact : highlight orange même inactif.
- Adaptée `isDarkSurface` (fond slate-900/95 vs blanc).

### Signature — Contact CTA Banner
Panneau conversion beForensic : eyebrow uppercase, titre `font-black`, bouton « Me contacter » primary. Variants `dark` / `light` / `compact`. Signature du funnel gratuit → expert.

### Signature — Dual page shell
Racine de page = `.page-dark` ou `.page-light`. Toute nouvelle page publique choisit un mode avant tout autre styling.

## Do's and Don'ts

### Do:
- **Do** choisir `.page-dark` ou `.page-light` en racine de chaque page publique.
- **Do** utiliser `brand-orange` pour CTA, focus et états positifs produit.
- **Do** appliquer `.focus-ring` sur éléments interactifs.
- **Do** garder Inter + tracking-tight ; titres marketing en `font-black` si besoin d’impact.
- **Do** utiliser `rounded-card` / `rounded-panel` pour les surfaces produit.
- **Do** traiter l’admin (`/admin`) comme console séparée (slate), hors modes page.

### Don't:
- **Don't** unifier tout le site en dark ou light sans décision métier.
- **Don't** introduire emerald (ou un second accent succès) sur les parcours principaux.
- **Don't** utiliser `accent-rose` hors `.text-gradient`.
- **Don't** ajouter une nouvelle couleur de marque sans mettre à jour ce fichier + `tailwind.config.js` + `:root`.
- **Don't** empiler du glassmorphism / blur lourd sur toutes les cartes — blur = halo décoratif localisé.
- **Don't** remplacer la bottom nav publique par une top bar générique SaaS.
