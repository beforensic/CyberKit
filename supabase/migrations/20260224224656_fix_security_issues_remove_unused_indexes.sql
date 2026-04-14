/*
  # Remove Unused Indexes

  1. Changes
    - Drop unused index `idx_resources_type` on resources table
    - Drop unused index `idx_resources_tags` on resources table
    
  2. Reason
    - These indexes are not being used by any queries
    - Removing them reduces storage overhead and improves write performance
*/

DROP INDEX IF EXISTS idx_resources_type;
DROP INDEX IF EXISTS idx_resources_tags;
