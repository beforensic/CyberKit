---
name: CyberKit
description: Diagnostic cyber gratuit pour indépendants et TPE belges — Lanterne double, preuve humaine beForensic.
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
    fontFamily: "\"Source Serif 4\", Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "\"Source Serif 4\", Georgia, serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
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

CyberKit porte une flamme — la braise beForensic — dans deux chambres. La chambre sombre accroche et **montre l’humain** (Serge, expertise terrain belge). La chambre claire lit, choisit, remplit. Même orange ; la personnalité vient du **serif display** + de la preuve humaine, pas d’une grille d’icônes SaaS.

Le système est **direct, rassurant, incarné**. Indépendants et TPE belges non-technophiles : clarté de terrain, pas de théâtre cyber.

**Anti-références :** purple SaaS ; néon cyberpunk ; glassmorphism lourd ; emerald succès ; mur de cartes icône–titre–flèche comme structure principale d’une page marketing.

**Key Characteristics:**
- Dual Chamber : `.page-dark` (marketing / quiz) vs `.page-light` (lecture / formulaires)
- Display **Source Serif 4** sur heroes marketing ; Inter pour UI / corps
- Accent unique : braise beForensic (`#E8650A`)
- Preuve humaine : portrait Serge + ligne crédibilité RCCU sur surfaces Persuade
- Rayons généreux : `card` 1.5rem, `panel` 2rem
- Nav bottom dock + safe-area ; admin hors charte publique

## Colors

Palette courte : une braise d’action, un rose de dégradé rare, deux surfaces de mode, slate pour texte.

### Primary
- **Braise beForensic** (`#E8650A`) : CTA, liens actifs, badges, focus, halos.

### Secondary
- **Rose de flamme** (`#e11d48`) : uniquement `.text-gradient`.

### Neutral
- **Ardoise nuit** (`#0F172A`) / **Papier atelier** (`#FAFAFA`) / **Nuit profonde** (`#020617`) / blanc cartes / échelle slate.

### Named Rules
**The One Flame Rule.** Un seul accent d’action : `brand-orange`.

**The Dual Chamber Rule.** Marketing / diagnostic → `.page-dark`. Lecture / formulaires → `.page-light`.

**The Human First Rule.** Sur Home et surfaces Persuade, au moins une ancre humaine réelle (portrait / nom / expertise) avant ou à côté du catalogue d’outils.

## Typography

**Display Font:** Source Serif 4 (Georgia, serif) — classe `.font-display` / `font-display`  
**Body Font:** Inter (system-ui, sans-serif)

**Character:** Serif = voix humaine / institutionnelle belge. Inter = outil, boutons, labels.

### Hierarchy
- **Display** (Source Serif 4, 600, `clamp(2.5rem, 7vw, 4.5rem)`) : heroes Accueil, Quiz, About.
- **Headline** (Source Serif 4, 600) : titres de section marketing.
- **Title / Body / Label** (Inter) : UI, cartes, formulaires.

### Named Rules
**The Two Faces Rule.** Display serif uniquement sur titres marketing (`h1` / sections Persuade). Corps et contrôles restent Inter. Pas de serif sur boutons ni nav.

## Layout

Mobile-first. Conteneurs `max-w-6xl` / `5xl` / `4xl` / `3xl` / `2xl` (nav). `.nav-dock` + `.footer-with-nav` + `viewport-fit=cover`. CTA hero en colonne mobile.

Sur Home Persuade : hero → preuve humaine → parcours court → aperçu thèmes (≤4) → preuve Google passive → CTA contact (peak-end conversion).

### Named Rules
**The Bottom Dock Rule.** Nav publique en bas.

**The Catalogue Second Rule.** Sur l’accueil, le catalogue n’est jamais le premier acte : diagnostic et preuve humaine passent avant.

## Elevation & Depth

Hybride : tonal en dark ; ombres soft en light ; glow CTA en état hover seulement.

### Named Rules
**The Flat-By-Default Rule.** Surfaces dark plates ; glow = état, pas décor permanent.

## Shapes

Coins généreux (`card` / `panel` / `2xl`). Portrait : `rounded-3xl` avec bordure claire.

### Named Rules
**The Soft Shell Rule.** Préférer `card` / `panel` aux petits rayons sur surfaces produit.

## Components

### Buttons
Primary braise + `.btn-glow` ; secondary dark translucide ; ghost / lien texte pour tertiary. Toujours `.focus-ring`.

### Cards
Dark : `.surface-card-dark`. Light : blanc + `border-slate-100`. Éviter de structurer une page marketing uniquement en rangées icône–titre–flèche.

### Navigation
Bottom dock 6 items, cibles ≥44px, safe-area.

### Signature — Human Proof
Bloc portrait Serge + nom + une ligne RCCU + lien « Qui est beForensic ? ». Obligatoire sur Home ; modèle pour About.

### Signature — Contact CTA Banner
Conversion gratuit → expert. Fin de parcours Persuade préférée.

### Signature — Dual page shell
Racine = `.page-dark` ou `.page-light`.

## Do's and Don'ts

### Do:
- **Do** utiliser `font-display` sur les heroes marketing.
- **Do** montrer une preuve humaine réelle sur Home.
- **Do** choisir `.page-dark` ou `.page-light` en racine.
- **Do** garder braise pour CTA / focus / états positifs.
- **Do** limiter l’aperçu thèmes sur Home (≤4) + lien bibliothèque.

### Don't:
- **Don't** forcer Inter sur les titres display.
- **Don't** structurer le hero comme un dashboard de cartes icônes.
- **Don't** introduire emerald ou un second accent succès.
- **Don't** unifier dark/light sans décision métier.
- **Don't** terminer Home sur une demande d’avis : preuve passive puis conversion.
