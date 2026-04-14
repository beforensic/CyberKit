/*
  # Création des tables d'analytiques anonymes

  1. Nouvelles Tables
    - `diagnostic_completions`
      - `id` (uuid, clé primaire)
      - `score` (integer, score obtenu au diagnostic)
      - `profile_type` (text, type de profil: boutique, solo, equipe)
      - `completed_at` (timestamptz, date de complétion)
    
    - `resource_views`
      - `id` (uuid, clé primaire)
      - `resource_id` (uuid, référence à resources)
      - `resource_type` (text, type: video, audio, pdf, infographic, etc.)
      - `viewed_at` (timestamptz, date de consultation)
    
    - `search_queries`
      - `id` (uuid, clé primaire)
      - `query` (text, terme recherché en minuscules)
      - `searched_at` (timestamptz, date de recherche)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politique d'insertion pour les utilisateurs anonymes
    - Politique de lecture pour les administrateurs authentifiés
    
  3. Index
    - Index sur les dates pour améliorer les performances des requêtes d'agrégation
    - Index sur resource_id et query pour les jointures et regroupements

  Notes importantes:
    - Toutes les données sont anonymes (pas de user_id)
    - Les tables sont conçues uniquement pour des statistiques agrégées
*/

-- Table des diagnostics complétés
CREATE TABLE IF NOT EXISTS diagnostic_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  profile_type text NOT NULL CHECK (profile_type IN ('boutique', 'solo', 'equipe')),
  completed_at timestamptz DEFAULT now()
);

-- Table des vues de ressources
CREATE TABLE IF NOT EXISTS resource_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Table des recherches
CREATE TABLE IF NOT EXISTS search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  searched_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_diagnostic_completions_completed_at ON diagnostic_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_resource_views_resource_id ON resource_views(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_views_viewed_at ON resource_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries(query);
CREATE INDEX IF NOT EXISTS idx_search_queries_searched_at ON search_queries(searched_at);

-- Activer RLS
ALTER TABLE diagnostic_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- Politiques pour diagnostic_completions
CREATE POLICY "Permettre insertion anonyme des diagnostics"
  ON diagnostic_completions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Administrateurs peuvent lire les diagnostics"
  ON diagnostic_completions FOR SELECT
  TO authenticated
  USING (true);

-- Politiques pour resource_views
CREATE POLICY "Permettre insertion anonyme des vues"
  ON resource_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Administrateurs peuvent lire les vues"
  ON resource_views FOR SELECT
  TO authenticated
  USING (true);

-- Politiques pour search_queries
CREATE POLICY "Permettre insertion anonyme des recherches"
  ON search_queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Administrateurs peuvent lire les recherches"
  ON search_queries FOR SELECT
  TO authenticated
  USING (true);