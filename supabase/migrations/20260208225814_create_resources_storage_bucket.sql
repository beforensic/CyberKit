/*
  # Create storage bucket for resources
  
  1. Storage Setup
    - Create a public bucket named 'resources' for storing PDF, audio, and video files
    - Set up public access policies so files can be accessed by anyone
    - Allow authenticated users (admins) to upload, update, and delete files
  
  2. Security
    - Public read access for all users
    - Only authenticated users can upload/modify/delete files
*/

-- Create the storage bucket for resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resources')
WITH CHECK (bucket_id = 'resources');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources');