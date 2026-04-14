/*
  # Autoriser la lecture anonyme des logs de chat
  
  1. Modifications
    - Ajouter une politique SELECT pour les utilisateurs anonymes sur chat_logs
    - Permet à la page Administration de lire les statistiques sans authentification
  
  2. Sécurité
    - Les logs sont en lecture seule pour les utilisateurs anonymes
    - Seule l'insertion reste autorisée pour anon (pour le chatbot)
    - Aucune modification ou suppression n'est autorisée
*/

-- Supprimer l'ancienne politique restrictive
DROP POLICY IF EXISTS "Only authenticated users can read chat logs" ON chat_logs;

-- Créer une nouvelle politique permettant la lecture à tous (anon + authenticated)
CREATE POLICY "Allow read access to chat logs"
  ON chat_logs FOR SELECT
  TO anon, authenticated
  USING (true);