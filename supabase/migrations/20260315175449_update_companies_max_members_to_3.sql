/*
  # Update companies max_members default to 3

  1. Changes
    - Change default value of max_members from 5 to 3 for companies table
    - Update existing free companies to have max_members = 3
  
  2. Notes
    - This affects only free tier companies
    - Premium companies (status = 'paid') are not affected and keep unlimited members
*/

-- Change default value for max_members column
ALTER TABLE companies 
ALTER COLUMN max_members SET DEFAULT 3;

-- Update existing free companies to have max_members = 3
UPDATE companies 
SET max_members = 3 
WHERE status = 'free';