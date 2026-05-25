/*
  Archivage soft-delete des messages contact (RGPD : hors boîte active, conservation possible).
  La suppression définitive reste réservée aux messages déjà archivés.
*/

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS contact_messages_archived_at_idx
  ON public.contact_messages (archived_at)
  WHERE archived_at IS NOT NULL;

DROP FUNCTION IF EXISTS public.admin_list_contact_messages();

CREATE OR REPLACE FUNCTION public.admin_list_contact_messages(p_archived boolean DEFAULT false)
RETURNS SETOF public.contact_messages
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cm.*
  FROM public.contact_messages cm
  WHERE public.is_cyberkit_admin()
    AND (
      (p_archived AND cm.archived_at IS NOT NULL)
      OR (NOT p_archived AND cm.archived_at IS NULL)
    )
  ORDER BY COALESCE(cm.archived_at, cm.created_at) DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_archive_contact_message(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_cyberkit_admin() THEN
    RAISE EXCEPTION 'Accès admin requis';
  END IF;

  UPDATE public.contact_messages
  SET archived_at = now()
  WHERE id = p_message_id
    AND archived_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message introuvable ou déjà archivé';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_unarchive_contact_message(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_cyberkit_admin() THEN
    RAISE EXCEPTION 'Accès admin requis';
  END IF;

  UPDATE public.contact_messages
  SET archived_at = NULL
  WHERE id = p_message_id
    AND archived_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message introuvable ou non archivé';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_contact_message(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_cyberkit_admin() THEN
    RAISE EXCEPTION 'Accès admin requis';
  END IF;

  DELETE FROM public.contact_messages
  WHERE id = p_message_id
    AND archived_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message introuvable ou non archivé (archivez avant suppression définitive)';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_contact_messages(boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_archive_contact_message(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_unarchive_contact_message(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_contact_message(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_list_contact_messages(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_archive_contact_message(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_unarchive_contact_message(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_contact_message(uuid) TO authenticated;

COMMENT ON COLUMN public.contact_messages.archived_at IS
  'Date d''archivage admin ; NULL = message actif dans la boîte de réception.';

COMMENT ON FUNCTION public.admin_list_contact_messages(boolean) IS
  'Liste les messages contact actifs (false) ou archivés (true).';

COMMENT ON FUNCTION public.admin_archive_contact_message(uuid) IS
  'Archive un message contact (admin uniquement).';

COMMENT ON FUNCTION public.admin_unarchive_contact_message(uuid) IS
  'Restaure un message archivé dans la boîte active (admin uniquement).';

COMMENT ON FUNCTION public.admin_delete_contact_message(uuid) IS
  'Supprime définitivement un message déjà archivé (admin uniquement).';
