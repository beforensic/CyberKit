/*
  # Corriger les politiques RLS pour l'inscription entreprise

  1. Modifications
    - Ajout d'une politique pour permettre l'auto-inscription d'un membre lors de la création d'entreprise
    - Permet à un utilisateur de s'ajouter comme membre si son user_id correspond à l'admin de l'entreprise
  
  2. Sécurité
    - La politique reste restrictive : un utilisateur ne peut s'ajouter que si c'est lui l'admin de l'entreprise
    - Ne change pas les autres politiques existantes
*/

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Users can add themselves as admin member" ON company_members;

-- Ajouter une politique pour permettre l'auto-inscription comme premier membre/admin
CREATE POLICY "Users can add themselves as admin member"
ON company_members FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM companies c 
    WHERE c.id = company_members.company_id 
    AND c.admin_user_id = auth.uid()
  )
);
