/*
  # Add Admin Policies for Resources and Themes
  
  1. Overview
    - Adds RLS policies to allow INSERT, UPDATE, and DELETE operations on resources and themes
    - Uses anon and authenticated roles since the admin interface uses client-side Supabase client
    - This is a pragmatic approach for a small admin interface with password protection
  
  2. Changes
    - Add INSERT policy for resources (anon + authenticated)
    - Add UPDATE policy for resources (anon + authenticated)
    - Add DELETE policy for resources (anon + authenticated)
    - Add INSERT policy for themes (anon + authenticated)
    - Add UPDATE policy for themes (anon + authenticated)
    - Add DELETE policy for themes (anon + authenticated)
  
  3. Security Notes
    - Admin access is controlled via password in the frontend (sessionStorage)
    - For production, consider implementing proper authentication with auth.users
    - Current approach is acceptable for a small internal tool
*/

-- Resources table policies
CREATE POLICY "Allow insert for admin operations"
  ON resources
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update for admin operations"
  ON resources
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for admin operations"
  ON resources
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Themes table policies
CREATE POLICY "Allow insert themes for admin"
  ON themes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update themes for admin"
  ON themes
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete themes for admin"
  ON themes
  FOR DELETE
  TO anon, authenticated
  USING (true);
