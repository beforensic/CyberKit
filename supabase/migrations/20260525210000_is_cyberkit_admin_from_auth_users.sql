/*
  is_cyberkit_admin() lit le rôle dans auth.users (pas seulement le JWT).
  Après grant_cyberkit_admin.sql, les écritures CMS fonctionnent sans
  obligatoirement se déconnecter si le JWT n'a pas encore été rafraîchi.
*/

CREATE OR REPLACE FUNCTION public.is_cyberkit_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND (
      coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
      OR coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
      OR EXISTS (
        SELECT 1
        FROM auth.users u
        WHERE u.id = auth.uid()
          AND (
            coalesce(u.raw_app_meta_data ->> 'role', '') = 'admin'
            OR coalesce(u.raw_user_meta_data ->> 'role', '') = 'admin'
          )
      )
    );
$$;

COMMENT ON FUNCTION public.is_cyberkit_admin() IS
  'True for CyberKit admins: role=admin in JWT and/or auth.users metadata.';

CREATE OR REPLACE FUNCTION public.admin_check_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT public.is_cyberkit_admin();
$$;

REVOKE ALL ON FUNCTION public.admin_check_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_check_access() TO authenticated;

COMMENT ON FUNCTION public.admin_check_access() IS
  'Vérifie côté serveur que la session courante a les droits admin CMS.';
