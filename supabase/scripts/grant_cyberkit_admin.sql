/*
  À exécuter UNE FOIS dans Supabase → SQL Editor (avant ou juste après la migration RLS).

  Remplacez l'email par celui de votre compte admin (celui du gestionnaire de mots de passe).
*/

UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE email = 'REMPLACER_PAR_VOTRE_EMAIL_ADMIN';

-- Vérification (doit retourner 1 ligne avec role = admin)
SELECT id, email, raw_app_meta_data ->> 'role' AS role
FROM auth.users
WHERE email = 'REMPLACER_PAR_VOTRE_EMAIL_ADMIN';
