/*
  # Durcissement RLS — admin unique (app_metadata.role = 'admin')

  Corrige :
  - Écriture CMS (resources, themes, keywords) ouverte au rôle anon
  - Storage bucket "resources" modifiable en anon
  - Lecture publique de companies et chat_logs
  - Lecture analytics / contact_messages pour tout authenticated
  - resource_types bloqués par WITH CHECK (false)

  Prérequis AVANT d'appliquer en prod :
  1. Se connecter à Supabase Dashboard → SQL Editor
  2. Exécuter supabase/scripts/grant_cyberkit_admin.sql (remplacer l'email)
  3. Vérifier : SELECT is_cyberkit_admin(); avec une session admin

  L'admin front (signInWithPassword) utilise le JWT authenticated — pas la clé anon.
*/

-- ---------------------------------------------------------------------------
-- Helper : seul un utilisateur Auth avec app_metadata.role = 'admin'
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_cyberkit_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    coalesce(auth.role(), '') = 'authenticated'
    AND coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

COMMENT ON FUNCTION public.is_cyberkit_admin() IS
  'True when the JWT belongs to a CyberKit admin (app_metadata.role = admin).';

-- Invitation entreprise (uniquement si la table companies existe en prod)
DO $migration$
BEGIN
  IF to_regclass('public.companies') IS NOT NULL THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.validate_invitation_code(invitation_code text)
      RETURNS TABLE (id uuid, name text)
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      SET search_path = public
      AS $body$
        SELECT c.id, c.name
        FROM public.companies c
        WHERE c.invitation_code = validate_invitation_code.invitation_code
          AND coalesce(c.is_active, true) = true
        LIMIT 1;
      $body$;
    $fn$;
    REVOKE ALL ON FUNCTION public.validate_invitation_code(text) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.validate_invitation_code(text) TO anon, authenticated;
  END IF;
END
$migration$;

-- ===========================================================================
-- RESOURCES
-- ===========================================================================
DROP POLICY IF EXISTS "Allow insert for admin operations" ON public.resources;
DROP POLICY IF EXISTS "Allow update for admin operations" ON public.resources;
DROP POLICY IF EXISTS "Allow delete for admin operations" ON public.resources;
DROP POLICY IF EXISTS "Anon users can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Anon users can update resources" ON public.resources;
DROP POLICY IF EXISTS "Anon users can delete resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can update resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can delete resources" ON public.resources;
DROP POLICY IF EXISTS "Anyone can view resources" ON public.resources;

DROP POLICY IF EXISTS "Public can view resources" ON public.resources;
CREATE POLICY "Public can view resources"
  ON public.resources
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "CyberKit admin can insert resources"
  ON public.resources
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_cyberkit_admin());

CREATE POLICY "CyberKit admin can update resources"
  ON public.resources
  FOR UPDATE
  TO authenticated
  USING (public.is_cyberkit_admin())
  WITH CHECK (public.is_cyberkit_admin());

CREATE POLICY "CyberKit admin can delete resources"
  ON public.resources
  FOR DELETE
  TO authenticated
  USING (public.is_cyberkit_admin());

-- ===========================================================================
-- THEMES
-- ===========================================================================
DROP POLICY IF EXISTS "Allow insert themes for admin" ON public.themes;
DROP POLICY IF EXISTS "Allow update themes for admin" ON public.themes;
DROP POLICY IF EXISTS "Allow delete themes for admin" ON public.themes;
DROP POLICY IF EXISTS "Anon users can insert themes" ON public.themes;
DROP POLICY IF EXISTS "Anon users can update themes" ON public.themes;
DROP POLICY IF EXISTS "Anon users can delete themes" ON public.themes;
DROP POLICY IF EXISTS "Authenticated users can insert themes" ON public.themes;
DROP POLICY IF EXISTS "Authenticated users can update themes" ON public.themes;
DROP POLICY IF EXISTS "Authenticated users can delete themes" ON public.themes;
DROP POLICY IF EXISTS "Anyone can view themes" ON public.themes;

DROP POLICY IF EXISTS "Public can view themes" ON public.themes;
CREATE POLICY "Public can view themes"
  ON public.themes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "CyberKit admin can insert themes"
  ON public.themes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_cyberkit_admin());

CREATE POLICY "CyberKit admin can update themes"
  ON public.themes
  FOR UPDATE
  TO authenticated
  USING (public.is_cyberkit_admin())
  WITH CHECK (public.is_cyberkit_admin());

CREATE POLICY "CyberKit admin can delete themes"
  ON public.themes
  FOR DELETE
  TO authenticated
  USING (public.is_cyberkit_admin());

-- ===========================================================================
-- KEYWORDS
-- ===========================================================================
DROP POLICY IF EXISTS "Anyone can insert keywords" ON public.keywords;
DROP POLICY IF EXISTS "Anyone can update keywords" ON public.keywords;
DROP POLICY IF EXISTS "Anyone can delete keywords" ON public.keywords;
DROP POLICY IF EXISTS "Anyone can read keywords" ON public.keywords;

DROP POLICY IF EXISTS "Public can read keywords" ON public.keywords;
CREATE POLICY "Public can read keywords"
  ON public.keywords
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "CyberKit admin can insert keywords"
  ON public.keywords
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_cyberkit_admin());

CREATE POLICY "CyberKit admin can update keywords"
  ON public.keywords
  FOR UPDATE
  TO authenticated
  USING (public.is_cyberkit_admin())
  WITH CHECK (public.is_cyberkit_admin());

CREATE POLICY "CyberKit admin can delete keywords"
  ON public.keywords
  FOR DELETE
  TO authenticated
  USING (public.is_cyberkit_admin());

-- ===========================================================================
-- RESOURCE TYPES (remplace WITH CHECK (false))
-- ===========================================================================
DO $migration$
BEGIN
  IF to_regclass('public.resource_types') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Only admins can insert resource types" ON public.resource_types;
    DROP POLICY IF EXISTS "Only admins can update resource types" ON public.resource_types;
    DROP POLICY IF EXISTS "Only admins can delete resource types" ON public.resource_types;

    CREATE POLICY "CyberKit admin can insert resource types"
      ON public.resource_types
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_cyberkit_admin());

    CREATE POLICY "CyberKit admin can update resource types"
      ON public.resource_types
      FOR UPDATE
      TO authenticated
      USING (public.is_cyberkit_admin())
      WITH CHECK (public.is_cyberkit_admin());

    CREATE POLICY "CyberKit admin can delete resource types"
      ON public.resource_types
      FOR DELETE
      TO authenticated
      USING (public.is_cyberkit_admin());
  END IF;
END
$migration$;

-- ===========================================================================
-- STORAGE (bucket resources)
-- ===========================================================================
DROP POLICY IF EXISTS "Anon users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anon users can update" ON storage.objects;
DROP POLICY IF EXISTS "Anon users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

CREATE POLICY "CyberKit admin can upload resources files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resources'
    AND public.is_cyberkit_admin()
  );

CREATE POLICY "CyberKit admin can update resources files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'resources' AND public.is_cyberkit_admin())
  WITH CHECK (bucket_id = 'resources' AND public.is_cyberkit_admin());

CREATE POLICY "CyberKit admin can delete resources files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'resources' AND public.is_cyberkit_admin());

-- ===========================================================================
-- CHAT LOGS
-- ===========================================================================
DO $migration$
BEGIN
  IF to_regclass('public.chat_logs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Allow read access to chat logs" ON public.chat_logs;
    DROP POLICY IF EXISTS "Only authenticated users can read chat logs" ON public.chat_logs;

    CREATE POLICY "CyberKit admin can read chat logs"
      ON public.chat_logs
      FOR SELECT
      TO authenticated
      USING (public.is_cyberkit_admin());
  END IF;
END
$migration$;

-- INSERT anon conservé pour archivage futur côté chatbot
-- (policy "Anyone can insert chat logs" inchangée si déjà présente)

-- ===========================================================================
-- COMPANIES — fin de la lecture liste complète en anon
-- ===========================================================================
DO $migration$
BEGIN
  IF to_regclass('public.companies') IS NOT NULL THEN
    DROP POLICY IF EXISTS "lecture_publique_companies" ON public.companies;
    DROP POLICY IF EXISTS "Anyone can view company by invitation code" ON public.companies;
    DROP POLICY IF EXISTS "companies_read_by_invitation" ON public.companies;
  END IF;
END
$migration$;

-- companies_full_access (admin_user_id = auth.uid()) reste en place si table présente

-- ===========================================================================
-- CONTACT MESSAGES
-- ===========================================================================
DROP POLICY IF EXISTS "Authenticated users can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update message status" ON public.contact_messages;

CREATE POLICY "CyberKit admin can view contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (public.is_cyberkit_admin());

CREATE POLICY "CyberKit admin can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_cyberkit_admin())
  WITH CHECK (
    public.is_cyberkit_admin()
    AND status IN ('new', 'read', 'replied')
  );

-- ===========================================================================
-- ANALYTICS (lecture réservée à l'admin CyberKit)
-- ===========================================================================
DO $migration$
BEGIN
  IF to_regclass('public.diagnostic_completions') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Administrateurs peuvent lire les diagnostics" ON public.diagnostic_completions;
    CREATE POLICY "CyberKit admin can read diagnostic completions"
      ON public.diagnostic_completions
      FOR SELECT
      TO authenticated
      USING (public.is_cyberkit_admin());
  END IF;

  IF to_regclass('public.resource_views') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Administrateurs peuvent lire les vues" ON public.resource_views;
    CREATE POLICY "CyberKit admin can read resource views"
      ON public.resource_views
      FOR SELECT
      TO authenticated
      USING (public.is_cyberkit_admin());
  END IF;

  IF to_regclass('public.search_queries') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Administrateurs peuvent lire les recherches" ON public.search_queries;
    CREATE POLICY "CyberKit admin can read search queries"
      ON public.search_queries
      FOR SELECT
      TO authenticated
      USING (public.is_cyberkit_admin());
  END IF;
END
$migration$;
