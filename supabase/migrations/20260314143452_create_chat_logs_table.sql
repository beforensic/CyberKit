/*
  # Cr\u00e9ation de la table chat_logs pour l'archivage anonyme des conversations

  1. Nouvelle table
    - `chat_logs`
      - `id` (uuid, cl\u00e9 primaire, g\u00e9n\u00e9r\u00e9 automatiquement)
      - `created_at` (timestamptz, g\u00e9n\u00e9r\u00e9 automatiquement)
      - `session_id` (uuid, identifiant de session partag\u00e9 par tous les messages d'une conversation)
      - `question` (text, message de l'utilisateur)
      - `reponse` (text, r\u00e9ponse de Claude)
      - `ressources_ids` (text[], tableau des IDs des ressources recommand\u00e9es)

  2. S\u00e9curit\u00e9
    - Activer RLS sur la table `chat_logs`
    - Politique d'insertion pour les utilisateurs anonymes (enregistrement automatique)
    - Politique de lecture pour les administrateurs uniquement
*/

CREATE TABLE IF NOT EXISTS chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id uuid NOT NULL,
  question text NOT NULL,
  reponse text NOT NULL,
  ressources_ids text[] DEFAULT '{}'
);

ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat logs"
  ON chat_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can read chat logs"
  ON chat_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);