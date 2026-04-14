/*
  # Fix RLS policies for themes table
  
  1. Changes
    - Drop existing authenticated-only policies
    - Create new policies that allow anon role to insert, update, and delete themes
    - Keep public read access
  
  2. Security Note
    - This allows anonymous users (using anon key) to manage themes
    - In production, you would want to add proper authentication
    - For now, this allows the admin interface to function with the anon key
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert themes" ON themes;
DROP POLICY IF EXISTS "Authenticated users can update themes" ON themes;
DROP POLICY IF EXISTS "Authenticated users can delete themes" ON themes;

-- Allow anon users to insert themes
CREATE POLICY "Anon users can insert themes"
ON themes FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anon users to update themes
CREATE POLICY "Anon users can update themes"
ON themes FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow anon users to delete themes
CREATE POLICY "Anon users can delete themes"
ON themes FOR DELETE
TO anon
USING (true);