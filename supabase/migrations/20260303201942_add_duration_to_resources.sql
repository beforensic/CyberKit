/*
  # Ajouter la colonne durée aux ressources

  1. Modifications
    - Ajout de la colonne `duration` à la table `resources`
      - Type: integer (durée en minutes)
      - Nullable: oui (certaines ressources n'ont pas de durée)
      - Utilisation: pour les ressources audio et vidéo uniquement
  
  2. Notes
    - La durée est stockée en minutes pour simplifier l'affichage
    - Les ressources existantes auront une valeur NULL par défaut
    - Aucun impact sur les autres types de ressources
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources' AND column_name = 'duration'
  ) THEN
    ALTER TABLE resources ADD COLUMN duration integer;
  END IF;
END $$;