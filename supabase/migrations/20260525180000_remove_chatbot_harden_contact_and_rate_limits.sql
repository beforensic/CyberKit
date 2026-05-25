/*
  Retrait chatbot, fermeture INSERT public contact/chat_logs,
  table edge_rate_limits pour rate limiting des Edge Functions.
*/

-- ===========================================================================
-- CHAT LOGS — plus d'insertion anonyme
-- ===========================================================================
DO $migration$
BEGIN
  IF to_regclass('public.chat_logs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can insert chat logs" ON public.chat_logs;
  END IF;
END
$migration$;

-- ===========================================================================
-- CONTACT MESSAGES — insertion uniquement via Edge Function (service role)
-- ===========================================================================
DROP POLICY IF EXISTS "Users can submit valid contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;

-- ===========================================================================
-- RATE LIMITING (service role uniquement, pas d'accès API publique)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  bucket_key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_edge_rate_limits_window
  ON public.edge_rate_limits (window_start);
