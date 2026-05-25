/*
  Suppression d'un message contact par l'admin (RPC SECURITY DEFINER).
*/

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
  WHERE id = p_message_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message introuvable';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_contact_message(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_contact_message(uuid) TO authenticated;

COMMENT ON FUNCTION public.admin_delete_contact_message(uuid) IS
  'Supprime un message contact (admin uniquement).';
