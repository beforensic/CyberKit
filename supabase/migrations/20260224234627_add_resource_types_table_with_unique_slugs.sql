/*
  # Ajouter la table resource_types et nouveaux types de ressources

  1. Nouvelle table
    - `resource_types` : table pour gérer les types de ressources de manière dynamique
      - `id` (uuid, primary key)
      - `name` (text, unique) : nom du type (ex: "Présentation", "Guide", "Mémo", "Infographie", "Vidéo")
      - `technical_type` (text) : type technique (ex: "pdf", "video", "image")
      - `description` (text) : description du type
      - `icon_name` (text) : nom de l'icône Lucide React
      - `color` (text) : couleur associée (ex: "blue", "purple", "amber")
      - `order` (integer) : ordre d'affichage
      - `created_at` (timestamp)

  2. Modifications
    - Ajouter "image" à l'enum resource_type existant
    - Insérer les types de ressources par défaut

  3. Sécurité
    - Enable RLS sur resource_types
    - Politique SELECT pour tout le monde (anon + authenticated)
    - Politiques INSERT/UPDATE/DELETE restrictives par défaut
*/

-- Ajouter "image" à l'enum resource_type s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'image' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'resource_type')
  ) THEN
    ALTER TYPE resource_type ADD VALUE 'image';
  END IF;
END $$;

-- Créer la table resource_types
CREATE TABLE IF NOT EXISTS resource_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  technical_type text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  color text NOT NULL DEFAULT 'blue',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE resource_types ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tout le monde
CREATE POLICY "Anyone can view resource types"
  ON resource_types
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Politiques pour les admins (INSERT/UPDATE/DELETE)
-- Note: Ces politiques seront restrictives par défaut jusqu'à ce qu'un système d'admin soit mis en place
CREATE POLICY "Only admins can insert resource types"
  ON resource_types
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Only admins can update resource types"
  ON resource_types
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Only admins can delete resource types"
  ON resource_types
  FOR DELETE
  TO authenticated
  USING (false);

-- Insérer les types de ressources par défaut
INSERT INTO resource_types (name, technical_type, description, icon_name, color, "order")
VALUES
  ('Présentation', 'pdf', 'Pour une vue d''ensemble rapide et percutante. Idéal pour découvrir un sujet.', 'Presentation', 'blue', 1),
  ('Guide', 'pdf', 'Pour approfondir le sujet et maîtriser les détails techniques.', 'BookOpen', 'purple', 2),
  ('Mémo', 'pdf', 'Vos ''post-it numériques'' pour garder l''essentiel sous la main.', 'FileText', 'amber', 3),
  ('Infographie', 'image', 'Visualisations claires et synthétiques pour comprendre d''un coup d''œil.', 'BarChart3', 'emerald', 4),
  ('Vidéo', 'video', 'Contenus audiovisuels pour un apprentissage dynamique et interactif.', 'Video', 'red', 5)
ON CONFLICT (name) DO NOTHING;
