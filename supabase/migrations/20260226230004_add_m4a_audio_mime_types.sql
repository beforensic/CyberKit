/*
  # Ajout des types MIME pour les fichiers audio .m4a

  1. Modifications
    - Mise à jour du bucket 'resources' pour ajouter les types MIME suivants :
      - audio/x-m4a (format M4A standard)
      - audio/m4a (variante du format M4A)
      - audio/mp4 (variante possible du format M4A/MP4 audio)

    - Ces types s'ajoutent aux types déjà acceptés :
      - application/pdf (fichiers PDF)
      - image/png, image/jpeg, image/jpg (images)
      - video/mp4, video/webm, video/quicktime (vidéos)
      - audio/mpeg, audio/mp3, audio/wav, audio/ogg, audio/webm (audio)

  2. Notes importantes
    - Cette migration corrige l'erreur "mime type audio/x-m4a is not supported"
    - Les fichiers M4A sont couramment générés par NotebookLM et d'autres outils
    - La limite de taille de fichier reste à 50 MB (52428800 octets)
*/

-- Mise à jour du bucket pour ajouter les types MIME M4A
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
    'audio/webm',
    'audio/x-m4a',
    'audio/m4a',
    'audio/mp4'
  ],
  file_size_limit = 52428800
WHERE id = 'resources';
