# CyberKit — Charte graphique et modes de page

Document de référence pour les choix visuels du site public et de l’admin.  
**Décision retenue (mai 2026) :** conserver le **double mode** dark / light par type d’écran, documenté ici — pas d’unification globale pour l’instant.

---

## 1. Intention par mode

| Mode | Classe | Rôle | Pages |
|------|--------|------|--------|
| **Marketing / diagnostic** | `.page-dark` | Impact, parcours quiz, immersion | `Home`, `Quiz`, `QuizResults` |
| **Lecture / utilitaire** | `.page-light` | Lisibilité longue, formulaires, catalogue | `Resources`, `Favorites`, `Contact`, `About`, `Legal` |

**Pourquoi deux modes (et pas un thème unique)**

- L’accueil et le quiz doivent « accrocher » et se distinguer (fond sombre, cartes glass).
- La bibliothèque, le contact et les pages institutionnelles privilégient le confort de lecture (fond clair, cartes blanches).
- Unifier tout en dark ou tout en light alourdirait soit la lecture (dark), soit le marketing (light).

**Admin** (`/admin`) : hors `AppLayout`, fond `slate-50` + sidebar `slate-900` — console outil, pas couverte par `page-dark` / `page-light`.

---

## 2. Tokens (source de vérité)

### Couleurs — `tailwind.config.js` + `:root` dans `src/index.css`

| Token | Hex | Usage |
|-------|-----|--------|
| `surface-dark` | `#0F172A` | Fond pages marketing |
| `surface-light` | `#FAFAFA` | Fond pages lecture + `body` par défaut |
| `surface-deep` | `#020617` | Accents très sombres (variables CSS) |
| `brand-orange` | `#E8650A` | CTA, liens actifs, badges, focus ring |
| `brand-orange-50` … `900` | échelle Tailwind | Fonds légers, hover, texte sur fond clair |
| `accent-rose` | `#e11d48` | Dégradé titre (`.text-gradient` uniquement) |

**Règle d’accent :** préférer `brand-orange` pour les actions et états positifs produit. Éviter `emerald` sur les parcours principaux (contact succès, coach, résultats) — alignement charte mai 2026.

### Composants utilitaires — `src/index.css`

| Classe | Effet |
|--------|--------|
| `.page-dark` | `min-h-screen bg-surface-dark text-slate-300` |
| `.page-light` | `min-h-screen bg-surface-light text-slate-900` |
| `.glass-card` | Carte sombre translucide (home, quiz) |
| `.text-gradient` | Titre dégradé orange → rose |
| `.btn-glow` | Hover CTA avec halo orange |
| `.focus-ring` | Focus clavier `ring-brand-orange` (a11y) |

### Typographie

- Police : **Inter** (chargée globalement, `!important` sur titres/texte dans `index.css`).
- Titres marketing : souvent `font-black`, `uppercase`, `tracking-wider` / `tracking-tight`.
- Corps lecture : `text-slate-500` / `600` sur fond clair ; `text-slate-300` / `400` sur fond sombre.

---

## 3. Rayons et cartes (convention actuelle)

Pas encore de composants `Button` / `Card` partagés — rayons **ad hoc** en Tailwind :

| Contexte | Rayon typique |
|----------|----------------|
| Carte ressource, formulaire contact, modales admin | `rounded-[2.5rem]` |
| Blocs home / quiz | `rounded-[2rem]` |
| Petits contrôles, tags | `rounded-xl` / `rounded-2xl` |
| Admin panel principal | `rounded-[3rem]` |

**Évolution prévue :** design system minimal (`src/ui/`) pour figer 2–3 rayons et 2 variantes de bouton — **après** stabilisation de ce document.

---

## 4. Checklist par nouvelle page

1. Choisir le mode : marketing → `page-dark` ; lecture / formulaire → `page-light`.
2. CTA principal : `bg-brand-orange` + `hover:bg-brand-orange-600`, ombre `shadow-brand-orange/20` si besoin.
3. Cartes : sur dark → `glass-card` ou `bg-slate-800/20` + bordure `border-slate-700/50` ; sur light → `bg-white` + `border-slate-100`.
4. Focus : ajouter `.focus-ring` sur les éléments interactifs.
5. Ne pas introduire de nouvelle couleur d’accent sans mise à jour de ce fichier et de `tailwind.config.js`.

---

## 5. Fichiers à modifier pour un changement global

| Changement | Fichiers |
|------------|----------|
| Couleur marque | `tailwind.config.js`, `:root` dans `src/index.css` |
| Fond / texte d’un mode | `.page-dark` / `.page-light` dans `src/index.css` |
| Nouvelle page publique | Fichier dans `src/pages/` + classe mode en racine du JSX |

---

## 6. Suite produit (hors scope immédiat)

- **Design system** (`src/ui/Button`, `Card`) : optionnel, 3–5 j — à lancer quand plusieurs écrans seront touchés en même temps.
- **Unification dark/light** : non prioritaire tant que la séparation marketing / lecture reste validée métier.
