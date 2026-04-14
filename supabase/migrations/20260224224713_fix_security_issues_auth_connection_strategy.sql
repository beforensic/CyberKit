/*
  # Fix Auth DB Connection Strategy
  
  1. Changes
    - Configure Auth server to use percentage-based connection allocation
    - This ensures better scaling when instance size increases
    
  2. Security
    - Improves Auth server performance and scalability
    - Allows automatic adjustment of connections based on instance size
*/

-- Set Auth pool configuration to use percentage-based allocation
-- This is typically done through Supabase dashboard settings
-- but we document it here for reference

-- Note: This setting is managed at the project level in Supabase
-- and cannot be changed via SQL migration.
-- This migration serves as documentation that this issue needs to be
-- addressed in the Supabase dashboard under Settings > Database > Connection pooling

-- Action required: Go to Supabase Dashboard > Project Settings > Database
-- and change Auth connection pool mode from "Session" to "Transaction" with percentage allocation
