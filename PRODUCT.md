# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Indépendants (solo / freelances) et TPE belges (avec salariés), **même poids**. Non-technophiles. Situation typique : peu de temps IT, besoin de savoir où ils en sont et quoi faire concrètement, sans jargon.

Autres audiences présentes dans le produit (secondaires, non prioritaires pour les décisions) : associations (page Contact), formulation « PME » (About / quiz label « TPE / PME »).

## Product Purpose

CyberKit sensibilise et monte en compétence cybersécurité via un parcours gratuit : diagnostic → ressources concrètes → prise de contact beForensic.

**Succès produit** (confirmé) :
1. Mesurer sa posture cyber (diagnostic / score)
2. Accéder à des ressources concrètes adaptées
3. Contacter beForensic (conversion vers accompagnement payant hors app : formation, coaching, audit, sensibilisation, webinaires, conférences)

## Positioning

Outil **100 % gratuit in-app** (pas d’abonnement, pas de paiement dans CyberKit), ancré Belgique / FR-BE, porté par l’expertise de Serge Houtain (ex-enquêteur PJF / RCCU, fondateur beForensic). Mécanisme : diagnostic clair + bibliothèque pédagogique + infobulles IA sur mots-clés ; l’offre payante passe uniquement par Contact / À propos → beForensic.

## Operating Context

- Site public : [cyberkit.be](https://www.cyberkit.be) (Vercel + Supabase)
- Parcours : Accueil → Quiz → Résultats (+ analyse IA) → Ressources / Favoris → Contact
- Persistance locale (navigateur) : score, favoris, intérêts thématiques, ressources consultées
- Admin CMS (`/admin`) : un compte admin Supabase, hors nav publique
- Accompagnement payant et marque expert : beForensic ([beforensic.be](https://beforensic.be))

## Capabilities and Constraints

**Capabilities (confirmées)**
- Diagnostic quiz (profils indépendant / TPE-PME)
- Analyse IA des résultats (`generate-analysis`)
- Bibliothèque de ressources (thèmes, tags, aperçu, téléchargement)
- Infobulles IA sur mots-clés (`explain-keyword`)
- Favoris et progression consultation (localStorage)
- Formulaire contact + notification email (Resend)
- Mentions légales / RGPD / cookies (tarteaucitron, Matomo opt-in)
- Console admin contenu

**Constraints**
- Pas d’espace entreprise multi-utilisateurs (retiré)
- Pas de Stripe / abonnements in-app (retiré)
- IA : JWT requis, CORS restreint, rate limits, plafonds journaliers
- Contenu catalogue en Supabase (pas figé dans le repo)

**Ouvert / à trancher**
- Standard d’accessibilité formel (RGAA / WCAG) : non défini produit
- Volume réel des ressources en prod : claim chiffré retiré de l’accueil ; chiffre exact à sourcer CMS avant réintroduction
- Déploiement Edge Functions après changement de prompts IA (`aiPrompts.ts`) : à faire en prod séparément

## Brand Commitments

- Nom produit : **CyberKit**
- Éditeur / marque expert : **beForensic** (Serge Houtain)
- Voix : français belge, vouvoiement, pédagogue, sans jargon technique inutile
- Gratuité in-app + lead beForensic : non négociable
- Assets : portrait Serge (`Profil-1-beforensic.png` / Storage Supabase), identité orange marque (DOCUMENTÉ dans DESIGN.md, hors scope init)

## Evidence on Hand

| Preuve | Statut | Chemin / note |
|--------|--------|----------------|
| Bio Serge + parcours PJF/RCCU | Présente (copy About) | `src/pages/About.tsx` |
| Portrait | Présent | Storage + fichiers racine `Profil-1-beforensic.png` |
| Avis Google | Lien réel beForensic Mons | `src/components/GoogleReview.tsx` — libellé aligné sur **beForensic** (pas CyberKit) |
| Disclaimer pédagogique | Présent | `src/pages/Legal.tsx` |
| Mentions BCE/TVA, adresse Mons | Présentes | `src/pages/Legal.tsx` |

**Ne pas inventer** : témoignages clients nommément, chiffres de conversion, certifications, benchmarks concurrentiels, count exact de ressources sans source CMS.

## Product Principles

1. **Gratuit pour monter, payant pour accompagner** — valeur pédagogique dans CyberKit ; conversion explicite vers beForensic.
2. **Clarté avant exhaustivité** — diagnostic et ressources actionnables pour non-technophiles.
3. **Belgique d’abord** — FR-BE, contexte TPE/indépendants belges, ton local.
4. **Preuves humaines** — expertise Serge / beForensic, pas de claims marketing non sourcés.
5. **Vie privée par défaut** — pas de compte public requis ; consentement pour audience ; contact volontaire.

## Accessibility & Inclusion

Accessibilité de base déjà travaillée (skip link, focus, ARIA nav, quiz/contact) d’après l’audit projet. **Aucun standard formel (WCAG/RGAA) ni audience en situation de handicap spécifique n’a été confirmé** comme exigence produit — ouvert.
