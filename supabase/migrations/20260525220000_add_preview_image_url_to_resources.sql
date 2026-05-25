/*
  Image d'aperçu optionnelle pour la bibliothèque (modal + vignette carte).
*/

ALTER TABLE public.resources
ADD COLUMN IF NOT EXISTS preview_image_url text;

COMMENT ON COLUMN public.resources.preview_image_url IS
  'URL publique d''une vignette ou infographie basse résolution pour l''aperçu avant téléchargement.';
