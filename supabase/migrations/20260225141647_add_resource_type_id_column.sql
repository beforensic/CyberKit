/*
  # Ajouter la colonne resource_type_id à la table resources

  1. Changements
    - Ajouter la colonne `resource_type_id` (UUID, clé étrangère vers resource_types)
    - Migrer les données existantes pour mapper les types techniques vers les types pédagogiques
    - Pour les ressources avec type='pdf', on choisit 'Guide' par défaut
    - Rendre la colonne NOT NULL après la migration des données
    - Ajouter une contrainte de clé étrangère

  2. Sécurité
    - Aucun changement aux politiques RLS
*/

-- Ajouter la nouvelle colonne (nullable temporairement pour la migration)
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS resource_type_id UUID;

-- Migrer les données existantes
-- pdf -> Guide (par défaut)
UPDATE resources 
SET resource_type_id = (SELECT id FROM resource_types WHERE technical_type = 'pdf' AND name = 'Guide')
WHERE type = 'pdf' AND resource_type_id IS NULL;

-- image -> Infographie
UPDATE resources 
SET resource_type_id = (SELECT id FROM resource_types WHERE technical_type = 'image')
WHERE type = 'image' AND resource_type_id IS NULL;

-- video -> Vidéo
UPDATE resources 
SET resource_type_id = (SELECT id FROM resource_types WHERE technical_type = 'video')
WHERE type = 'video' AND resource_type_id IS NULL;

-- Pour link et audio, on crée des types pédagogiques s'ils n'existent pas
INSERT INTO resource_types (name, technical_type, description, icon_name, color, "order")
VALUES 
  ('Lien externe', 'link', 'Ressource externe sur le web', 'ExternalLink', 'green', 6),
  ('Audio', 'audio', 'Contenu audio', 'Headphones', 'purple', 7)
ON CONFLICT (name) DO NOTHING;

-- Migrer les ressources de type link
UPDATE resources 
SET resource_type_id = (SELECT id FROM resource_types WHERE technical_type = 'link')
WHERE type = 'link' AND resource_type_id IS NULL;

-- Migrer les ressources de type audio
UPDATE resources 
SET resource_type_id = (SELECT id FROM resource_types WHERE technical_type = 'audio')
WHERE type = 'audio' AND resource_type_id IS NULL;

-- Rendre la colonne NOT NULL maintenant que toutes les données sont migrées
ALTER TABLE resources 
ALTER COLUMN resource_type_id SET NOT NULL;

-- Ajouter la contrainte de clé étrangère
ALTER TABLE resources
ADD CONSTRAINT resources_resource_type_id_fkey 
FOREIGN KEY (resource_type_id) 
REFERENCES resource_types(id)
ON DELETE RESTRICT;