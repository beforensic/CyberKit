/*
  # Add diagnostic profile to company members

  1. Changes
    - Add `diagnostic_profile` column to `company_members` table
    - This column stores the diagnostic profile assigned to each member
    - Values can be: 'boutique', 'solo', 'equipe', or NULL
  
  2. Security
    - No RLS changes needed (existing policies apply)
*/

ALTER TABLE company_members 
ADD COLUMN IF NOT EXISTS diagnostic_profile text;