/*
  # Création des tables pour l'espace entreprise

  1. Nouvelles Tables
    - `companies`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `name` (text) - Nom de l'entreprise
      - `admin_email` (text) - Email de l'administrateur
      - `admin_user_id` (uuid) - Référence vers auth.users
      - `status` (text) - 'free' ou 'paid'
      - `max_members` (integer) - Nombre max de membres (défaut: 5)
      - `invitation_code` (text, unique) - Code d'invitation généré
      - `is_active` (boolean) - Statut actif/inactif
      - `sector` (text) - Secteur d'activité
      - `employee_count` (text) - Nombre d'employés

    - `company_members`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `company_id` (uuid) - Référence vers companies
      - `user_id` (uuid) - Référence vers auth.users
      - `email` (text) - Email du membre
      - `role` (text) - 'admin' ou 'member'
      - `status` (text) - 'pending' ou 'active'
      - `invited_at` (timestamp)
      - `activated_at` (timestamp)
      - `first_name` (text) - Prénom
      - `last_name` (text) - Nom

    - `company_diagnostics`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `company_id` (uuid) - Référence vers companies
      - `member_id` (uuid) - Référence vers company_members
      - `score` (integer) - Score du diagnostic
      - `risk_level` (text) - Niveau de risque
      - `profile` (text) - Profil de sécurité
      - `completed_at` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Policies pour companies : lecture/écriture pour admin de la company
    - Policies pour company_members : lecture pour membres, écriture pour admin
    - Policies pour company_diagnostics : lecture pour admin, insertion pour membre concerné
*/

-- Création de la table companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  admin_email text NOT NULL,
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'free' CHECK (status IN ('free', 'paid')),
  max_members integer DEFAULT 5,
  invitation_code text UNIQUE DEFAULT substring(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  is_active boolean DEFAULT true,
  sector text,
  employee_count text
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policies pour companies
CREATE POLICY "Admins can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (admin_user_id = auth.uid());

CREATE POLICY "Admins can update their own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (admin_user_id = auth.uid())
  WITH CHECK (admin_user_id = auth.uid());

CREATE POLICY "Anyone can insert a new company"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view company by invitation code"
  ON companies FOR SELECT
  TO anon, authenticated
  USING (true);

-- Création de la table company_members
CREATE TABLE IF NOT EXISTS company_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  invited_at timestamptz DEFAULT now(),
  activated_at timestamptz,
  first_name text,
  last_name text
);

ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Policies pour company_members
CREATE POLICY "Members can view members of their company"
  ON company_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = company_members.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Company admins can insert members"
  ON company_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_id
      AND c.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can update members"
  ON company_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_id
      AND c.admin_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_id
      AND c.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update their own profile"
  ON company_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view company members by invitation code"
  ON company_members FOR SELECT
  TO anon, authenticated
  USING (true);

-- Création de la table company_diagnostics
CREATE TABLE IF NOT EXISTS company_diagnostics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  member_id uuid REFERENCES company_members(id) ON DELETE CASCADE,
  score integer,
  risk_level text,
  profile text,
  completed_at timestamptz DEFAULT now(),
  answers jsonb
);

ALTER TABLE company_diagnostics ENABLE ROW LEVEL SECURITY;

-- Policies pour company_diagnostics
CREATE POLICY "Company admins can view all diagnostics"
  ON company_diagnostics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_id
      AND c.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Members can view their own diagnostics"
  ON company_diagnostics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.id = member_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert their own diagnostics"
  ON company_diagnostics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.id = member_id
      AND cm.user_id = auth.uid()
    )
  );

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_companies_admin_user_id ON companies(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_companies_invitation_code ON companies(invitation_code);
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_diagnostics_company_id ON company_diagnostics(company_id);
CREATE INDEX IF NOT EXISTS idx_company_diagnostics_member_id ON company_diagnostics(member_id);