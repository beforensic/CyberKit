/*
  # Add UPDATE and DELETE policies for keywords table

  1. Changes
    - Add policy to allow anyone (anon) to UPDATE keywords
    - Add policy to allow anyone (anon) to DELETE keywords
  
  2. Security
    - These policies are needed for the admin interface to manage keywords
    - Since this is an admin-only feature in the UI, consider adding authentication in a future update
    - For now, matching the existing permissive approach for SELECT and INSERT
*/

-- Allow anyone to update keywords
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keywords' AND policyname = 'Anyone can update keywords'
  ) THEN
    CREATE POLICY "Anyone can update keywords"
      ON keywords
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Allow anyone to delete keywords
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keywords' AND policyname = 'Anyone can delete keywords'
  ) THEN
    CREATE POLICY "Anyone can delete keywords"
      ON keywords
      FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;
