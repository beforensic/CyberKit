/*
  # Fix RLS Policies for Themes Table

  1. Changes
    - Keep SELECT policy for public access (themes are shown to all users)
    - Remove overly permissive INSERT, UPDATE, DELETE policies for anon users
    - Only allow service_role to modify themes (admin backend only)
    
  2. Security
    - Themes can be read by anyone (needed for public theme browsing)
    - Only server-side admin operations can modify themes
    - Prevents unrestricted access that bypasses RLS
    
  3. Implementation Note
    - Admin UI will need to use service_role key for modifications
    - This should be done through Edge Functions, not client-side
*/

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anon users can insert themes" ON themes;
DROP POLICY IF EXISTS "Anon users can update themes" ON themes;
DROP POLICY IF EXISTS "Anon users can delete themes" ON themes;
DROP POLICY IF EXISTS "Anyone can view themes" ON themes;

-- Allow everyone to read themes (needed for public theme browsing)
CREATE POLICY "Public can view themes"
  ON themes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: INSERT, UPDATE, DELETE for themes should only be done
-- via service_role through Edge Functions or server-side operations
-- No client-side policies are needed for these operations
