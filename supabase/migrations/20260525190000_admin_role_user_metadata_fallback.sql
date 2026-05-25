-- Accepte role admin dans app_metadata OU user_metadata (JWT)
CREATE OR REPLACE FUNCTION public.is_cyberkit_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    coalesce(auth.role(), '') = 'authenticated'
    AND (
      coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
      OR coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
    );
$$;
