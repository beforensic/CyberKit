/*
  # Create Securicoach Database Schema

  ## Overview
  This migration creates the complete database structure for the Securicoach application,
  a cybersecurity resource management platform.

  ## 1. New Tables
  
  ### `themes` table
  - `id` (uuid, primary key) - Unique identifier for each theme
  - `title` (text, not null) - Theme title
  - `description` (text) - Detailed theme description
  - `slug` (text, unique, not null) - URL-friendly identifier
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `resources` table
  - `id` (uuid, primary key) - Unique identifier for each resource
  - `theme_id` (uuid, foreign key) - Reference to parent theme
  - `title` (text, not null) - Resource title
  - `description` (text) - Resource description
  - `type` (enum) - Resource type: 'pdf', 'audio', 'video', or 'link'
  - `url` (text, not null) - Resource URL or file path
  - `tags` (text[]) - Array of searchable tags
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
  
  ### Row Level Security (RLS)
  - Both tables have RLS enabled for data protection
  - Public read access for all authenticated and anonymous users (educational content)
  - Write access requires authentication (for admin functionality)
  
  ### Policies Created
  - `themes`: Public SELECT, authenticated INSERT/UPDATE/DELETE
  - `resources`: Public SELECT, authenticated INSERT/UPDATE/DELETE

  ## 3. Important Notes
  - The `type` enum restricts resource types to valid values
  - Foreign key constraint ensures data integrity between themes and resources
  - Timestamps are automatically managed with defaults and triggers
  - Tags array allows flexible categorization and search functionality
*/

-- Create enum for resource types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
    CREATE TYPE resource_type AS ENUM ('pdf', 'audio', 'video', 'link');
  END IF;
END $$;

-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type resource_type NOT NULL,
  url text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resources_theme_id ON resources(theme_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug);

-- Enable Row Level Security
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Policies for themes table
DROP POLICY IF EXISTS "Anyone can view themes" ON themes;
CREATE POLICY "Anyone can view themes"
  ON themes FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert themes" ON themes;
CREATE POLICY "Authenticated users can insert themes"
  ON themes FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update themes" ON themes;
CREATE POLICY "Authenticated users can update themes"
  ON themes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete themes" ON themes;
CREATE POLICY "Authenticated users can delete themes"
  ON themes FOR DELETE
  TO authenticated
  USING (true);

-- Policies for resources table
DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert resources" ON resources;
CREATE POLICY "Authenticated users can insert resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update resources" ON resources;
CREATE POLICY "Authenticated users can update resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete resources" ON resources;
CREATE POLICY "Authenticated users can delete resources"
  ON resources FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_themes_updated_at ON themes;
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();