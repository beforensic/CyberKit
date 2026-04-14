/*
  # Fix RLS Policies for Keywords Table

  1. Changes
    - Keep SELECT policy for public access (keywords are shown to all users)
    - Remove INSERT, UPDATE, DELETE policies for anon users
    - Only allow service_role to modify keywords (admin backend only)
    
  2. Security
    - Keywords can be read by anyone (needed for UI search functionality)
    - Only server-side admin operations can modify keywords
    - Prevents unrestricted access that bypasses RLS
    
  3. Implementation Note
    - Admin UI will need to use service_role key for modifications
    - This should be done through Edge Functions, not client-side
*/

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert keywords" ON keywords;
DROP POLICY IF EXISTS "Anyone can update keywords" ON keywords;
DROP POLICY IF EXISTS "Anyone can delete keywords" ON keywords;
DROP POLICY IF EXISTS "Anyone can read keywords" ON keywords;

-- Allow everyone to read keywords (needed for search functionality)
CREATE POLICY "Public can read keywords"
  ON keywords
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: INSERT, UPDATE, DELETE for keywords should only be done
-- via service_role through Edge Functions or server-side operations
-- No client-side policies are needed for these operations
