/*
  À exécuter UNE FOIS dans Supabase → SQL Editor.

  1. Remplacez l'email ci-dessous par celui de votre compte admin (/admin).
  2. Appliquez aussi la migration 20260525210000_is_cyberkit_admin_from_auth_users.sql
     (is_cyberkit_admin lit auth.users — écritures CMS sans JWT obsolète).
  3. Déconnexion / reconnexion sur /admin si besoin.
*/

UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE email = 'REMPLACER_PAR_VOTRE_EMAIL_ADMIN';

-- Vérification (doit retourner 1 ligne avec role = admin)
SELECT id, email, raw_app_meta_data ->> 'role' AS role
FROM auth.users
WHERE email = 'REMPLACER_PAR_VOTRE_EMAIL_ADMIN';
