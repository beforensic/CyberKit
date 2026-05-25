/*
  Liste / mise à jour des messages contact pour l'admin (sans Edge Function).
  SECURITY DEFINER + is_cyberkit_admin() pour éviter les blocages RLS côté client.
*/

CREATE OR REPLACE FUNCTION public.admin_list_contact_messages()
RETURNS SETOF public.contact_messages
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cm.*
  FROM public.contact_messages cm
  WHERE public.is_cyberkit_admin()
  ORDER BY cm.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_contact_message_status(
  p_message_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_cyberkit_admin() THEN
    RAISE EXCEPTION 'Accès admin requis';
  END IF;

  IF p_status NOT IN ('new', 'read', 'replied') THEN
    RAISE EXCEPTION 'Statut invalide';
  END IF;

  UPDATE public.contact_messages
  SET status = p_status
  WHERE id = p_message_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_contact_messages() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_contact_message_status(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_list_contact_messages() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_contact_message_status(uuid, text) TO authenticated;

COMMENT ON FUNCTION public.admin_list_contact_messages() IS
  'Retourne les messages contact pour un admin CyberKit (JWT app_metadata.role = admin).';

COMMENT ON FUNCTION public.admin_update_contact_message_status(uuid, text) IS
  'Met à jour le statut d''un message contact (admin uniquement).';
