/*
  # Create keywords table

  1. New Tables
    - `keywords`
      - `id` (uuid, primary key) - Unique identifier for each keyword
      - `keyword` (text, unique, not null) - The keyword text
      - `created_at` (timestamptz) - When the keyword was created
  
  2. Security
    - Enable RLS on `keywords` table
    - Add policy for anonymous users to read keywords
    - Add policy for anonymous users to insert keywords
*/

CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read keywords"
  ON keywords
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert keywords"
  ON keywords
  FOR INSERT
  TO anon
  WITH CHECK (true);