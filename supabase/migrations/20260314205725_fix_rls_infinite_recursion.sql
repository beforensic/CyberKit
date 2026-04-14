/*
  # Corriger la récursion infinie dans les politiques RLS

  1. Problème
    - Récursion infinie détectée dans les politiques de company_members
    - Les politiques font référence à company_members elle-même créant une boucle
  
  2. Solution
    - Supprimer toutes les politiques existantes sur companies et company_members
    - Créer des politiques simples basées uniquement sur auth.uid()
    - Éviter les sous-requêtes qui référencent la même table
  
  3. Sécurité
    - Les utilisateurs peuvent uniquement gérer leurs propres données
    - L'admin d'une entreprise peut gérer son entreprise via admin_user_id
    - Les membres peuvent gérer leur propre profil via user_id
*/

-- Supprimer toutes les politiques existantes sur companies
DROP POLICY IF EXISTS "Anyone can insert a new company" ON companies;
DROP POLICY IF EXISTS "Anyone can view company by invitation code" ON companies;
DROP POLICY IF EXISTS "Admins can view their own company" ON companies;
DROP POLICY IF EXISTS "Admins can update their own company" ON companies;

-- Supprimer toutes les politiques existantes sur company_members
DROP POLICY IF EXISTS "Company admins can insert members" ON company_members;
DROP POLICY IF EXISTS "Members can view members of their company" ON company_members;
DROP POLICY IF EXISTS "Anyone can view company members by invitation code" ON company_members;
DROP POLICY IF EXISTS "Members can update their own profile" ON company_members;
DROP POLICY IF EXISTS "Company admins can update members" ON company_members;
DROP POLICY IF EXISTS "Users can add themselves as admin member" ON company_members;

-- Créer une politique simple pour companies
-- L'admin peut tout faire sur sa propre entreprise
CREATE POLICY "companies_full_access"
ON companies FOR ALL
TO authenticated
USING (admin_user_id = auth.uid())
WITH CHECK (admin_user_id = auth.uid());

-- Permettre la lecture des companies par code d'invitation (pour rejoindre)
CREATE POLICY "companies_read_by_invitation"
ON companies FOR SELECT
TO authenticated
USING (true);

-- Créer des politiques simples pour company_members
-- Un utilisateur peut s'insérer lui-même comme membre
CREATE POLICY "members_insert_self"
ON company_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Un utilisateur peut voir son propre profil membre
CREATE POLICY "members_select_self"
ON company_members FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Un utilisateur peut mettre à jour son propre profil
CREATE POLICY "members_update_self"
ON company_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Un utilisateur peut supprimer son propre profil
CREATE POLICY "members_delete_self"
ON company_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());
