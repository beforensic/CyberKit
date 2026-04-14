/*
  # Fix RLS Policies for Resources Table

  1. Changes
    - Keep SELECT policy for public access (resources are shown to all users)
    - Remove overly permissive INSERT, UPDATE, DELETE policies for anon users
    - Only allow service_role to modify resources (admin backend only)
    
  2. Security
    - Resources can be read by anyone (needed for public resource library)
    - Only server-side admin operations can modify resources
    - Prevents unrestricted access that bypasses RLS
    
  3. Implementation Note
    - Admin UI will need to use service_role key for modifications
    - This should be done through Edge Functions, not client-side
*/

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anon users can insert resources" ON resources;
DROP POLICY IF EXISTS "Anon users can update resources" ON resources;
DROP POLICY IF EXISTS "Anon users can delete resources" ON resources;
DROP POLICY IF EXISTS "Anyone can view resources" ON resources;

-- Allow everyone to read resources (needed for public resource library)
CREATE POLICY "Public can view resources"
  ON resources
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: INSERT, UPDATE, DELETE for resources should only be done
-- via service_role through Edge Functions or server-side operations
-- No client-side policies are needed for these operations
