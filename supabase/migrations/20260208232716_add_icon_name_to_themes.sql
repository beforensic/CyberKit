/*
  # Add icon_name column to themes table

  1. Changes
    - Add `icon_name` column to `themes` table
      - Type: text (stores Lucide icon component name)
      - Nullable: yes (for backward compatibility)
    
  2. Data Updates
    - Update existing themes with their corresponding icon names
    - Icon mappings:
      - Cadre juridique → Gavel
      - Confidentialité → EyeOff
      - Généralités → Info
      - Gouvernance → Landmark
      - Ingénierie sociale → Brain
      - Malveillance → ShieldAlert
      - Mots de passe → Key
      - Réseaux sociaux → Share2
      - Sauvegardes → HardDrive
      - Systèmes d'information → Network
      - Ressources externes → Globe
*/

-- Add icon_name column to themes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'themes' AND column_name = 'icon_name'
  ) THEN
    ALTER TABLE themes ADD COLUMN icon_name text;
  END IF;
END $$;

-- Update existing themes with their corresponding icons
UPDATE themes SET icon_name = 'Gavel' WHERE title = 'Cadre juridique';
UPDATE themes SET icon_name = 'EyeOff' WHERE title = 'Confidentialité';
UPDATE themes SET icon_name = 'Info' WHERE title = 'Généralités';
UPDATE themes SET icon_name = 'Landmark' WHERE title = 'Gouvernance';
UPDATE themes SET icon_name = 'Brain' WHERE title = 'Ingénierie sociale';
UPDATE themes SET icon_name = 'ShieldAlert' WHERE title = 'Malveillance';
UPDATE themes SET icon_name = 'Key' WHERE title = 'Mots de passe';
UPDATE themes SET icon_name = 'Share2' WHERE title = 'Réseaux sociaux';
UPDATE themes SET icon_name = 'HardDrive' WHERE title = 'Sauvegardes';
UPDATE themes SET icon_name = 'Network' WHERE title = 'Systèmes d''information';
UPDATE themes SET icon_name = 'Globe' WHERE title = 'Ressources externes';