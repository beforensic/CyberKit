/*
  # Permettre la création de mots-clés depuis le client

  1. Modifications
    - Ajouter une politique INSERT pour permettre aux utilisateurs d'ajouter de nouveaux mots-clés
    - Ajouter une politique UPDATE pour permettre la modification des mots-clés existants
    - Ajouter une politique DELETE pour permettre la suppression des mots-clés
    
  2. Sécurité
    - Les mots-clés peuvent être lus par tous (anon + authenticated)
    - Les mots-clés peuvent être insérés par tous (anon + authenticated)
    - Les mots-clés peuvent être mis à jour par tous (anon + authenticated)
    - Les mots-clés peuvent être supprimés par tous (anon + authenticated)
    - La contrainte UNIQUE sur la colonne 'keyword' empêche les doublons
    
  3. Justification
    - L'interface utilisateur permet la création de tags à la volée lors de l'ajout de ressources
    - Les utilisateurs doivent pouvoir créer des mots-clés pour enrichir le système de tags
    - La contrainte UNIQUE au niveau de la base de données garantit l'intégrité des données
*/

-- Politique INSERT pour permettre à tout le monde d'ajouter des mots-clés
CREATE POLICY "Anyone can insert keywords"
  ON keywords
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politique UPDATE pour permettre à tout le monde de modifier des mots-clés
CREATE POLICY "Anyone can update keywords"
  ON keywords
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Politique DELETE pour permettre à tout le monde de supprimer des mots-clés
CREATE POLICY "Anyone can delete keywords"
  ON keywords
  FOR DELETE
  TO anon, authenticated
  USING (true);
