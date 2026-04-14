/*
  # Fix storage policies for anonymous access
  
  1. Changes
    - Allow anonymous (anon role) users to upload, update, and delete files
    - This is needed because the admin interface uses the anon key, not authenticated users
  
  2. Security Note
    - In production, you would want to add proper authentication
    - For now, this allows the admin interface to function with the anon key
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Allow anon users to upload files
CREATE POLICY "Anon users can upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'resources');

-- Allow anon users to update files
CREATE POLICY "Anon users can update"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'resources')
WITH CHECK (bucket_id = 'resources');

-- Allow anon users to delete files
CREATE POLICY "Anon users can delete"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'resources');