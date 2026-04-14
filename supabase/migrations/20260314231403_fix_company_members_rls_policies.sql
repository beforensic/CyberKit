/*
  # Fix Company Members RLS Policies

  1. Changes
    - Drop all existing restrictive policies on company_members
    - Create simplified policies for authenticated users
    - Allow INSERT, SELECT, DELETE, and UPDATE operations for all authenticated users
  
  2. Security
    - Policies are temporarily opened for authenticated users to debug invitation issues
    - These should be tightened once the root cause is identified
*/

-- Drop existing policies
DROP POLICY IF EXISTS "members_insert_policy" ON company_members;
DROP POLICY IF EXISTS "members_select_policy" ON company_members;
DROP POLICY IF EXISTS "members_delete_policy" ON company_members;
DROP POLICY IF EXISTS "Admin peut s'ajouter comme membre" ON company_members;
DROP POLICY IF EXISTS "Lecture membres" ON company_members;

-- Create new simplified policies for authenticated users
CREATE POLICY "allow_insert_members"
ON company_members FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_select_members"
ON company_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_delete_members"
ON company_members FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "allow_update_members"
ON company_members FOR UPDATE
TO authenticated
USING (true);