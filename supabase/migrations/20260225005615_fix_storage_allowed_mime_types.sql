/*
  # Correction des types MIME autorisés pour le bucket resources

  1. Modifications
    - Mise à jour du bucket 'resources' pour accepter les types MIME suivants :
      - application/pdf (fichiers PDF)
      - image/png (images PNG)
      - image/jpeg (images JPEG)
      - video/mp4 (vidéos MP4)
      - video/webm (vidéos WebM)
      - audio/mpeg (fichiers audio MP3)
      - audio/wav (fichiers audio WAV)
      - audio/ogg (fichiers audio OGG)

  2. Notes importantes
    - Cette migration corrige l'erreur "mime type image/png is not supported"
    - Les restrictions de types MIME sont levées pour permettre tous les formats nécessaires
*/

-- Update the bucket to allow specific mime types
UPDATE storage.buckets
SET 
  allowed_mime_types = ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm'
  ],
  file_size_limit = 52428800
WHERE id = 'resources';
