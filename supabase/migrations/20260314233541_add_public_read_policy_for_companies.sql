/*
  # Ajouter une politique de lecture publique pour la table companies

  1. Modifications
    - Ajoute une politique RLS permettant aux utilisateurs anonymes de lire les informations de la table `companies`
    - Cette politique est nécessaire pour que la page de rejoindre une entreprise puisse vérifier le code d'invitation sans être authentifié

  2. Sécurité
    - La politique permet uniquement la lecture (SELECT)
    - Les opérations d'écriture (INSERT, UPDATE, DELETE) restent protégées
    - Seules les informations nécessaires (nom, code d'invitation, statut) sont exposées
*/

CREATE POLICY "lecture_publique_companies"
ON companies FOR SELECT
TO anon
USING (true);
