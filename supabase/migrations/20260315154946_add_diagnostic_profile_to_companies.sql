/*
  # Ajouter le champ profil diagnostic aux entreprises

  1. Modifications
    - Ajouter la colonne `diagnostic_profile` à la table `companies`
    - Cette colonne permet à l'admin d'imposer un profil diagnostic à tous les membres
    - Valeurs possibles: 'boutique', 'solo', 'equipe' ou NULL (choix libre)

  2. Notes
    - La colonne est nullable pour permettre le choix libre si non défini
    - Pas de contrainte CHECK car les valeurs sont gérées côté application
*/

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS diagnostic_profile text;

COMMENT ON COLUMN companies.diagnostic_profile IS 'Profil diagnostic imposé aux membres: boutique, solo, equipe ou NULL pour choix libre';