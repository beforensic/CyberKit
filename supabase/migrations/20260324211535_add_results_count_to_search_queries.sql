/*
  # Ajouter le nombre de résultats aux recherches

  1. Modifications
    - Ajouter la colonne `results_count` à la table `search_queries`
      - `results_count` (integer, nombre de ressources trouvées)
      - Valeur par défaut: 0
      - Ne peut pas être négatif

  2. Index
    - Index sur results_count pour faciliter les requêtes de statistiques

  Notes importantes:
    - Cette colonne permet de tracker si une recherche retourne des résultats
    - Utile pour identifier les termes qui ne donnent aucun résultat
*/

-- Ajouter la colonne results_count si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_queries' AND column_name = 'results_count'
  ) THEN
    ALTER TABLE search_queries
    ADD COLUMN results_count integer DEFAULT 0 CHECK (results_count >= 0);
  END IF;
END $$;

-- Ajouter un index pour améliorer les performances des statistiques
CREATE INDEX IF NOT EXISTS idx_search_queries_results_count ON search_queries(results_count);
