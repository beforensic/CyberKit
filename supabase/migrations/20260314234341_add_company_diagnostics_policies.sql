/*
  # Ajouter les politiques RLS pour company_diagnostics

  1. Modifications
    - Ajoute une politique permettant aux utilisateurs authentifiés d'insérer leurs diagnostics
    - Ajoute une politique permettant aux utilisateurs authentifiés de lire les diagnostics

  2. Sécurité
    - Les utilisateurs authentifiés peuvent créer leurs propres diagnostics
    - Les utilisateurs authentifiés peuvent lire tous les diagnostics (nécessaire pour le tableau de bord entreprise)
*/

CREATE POLICY "insert_diagnostic"
ON company_diagnostics FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "select_diagnostic"
ON company_diagnostics FOR SELECT
TO authenticated
USING (true);
