/*
  Align diagnostic_completions.profile_type with current quiz profiles
  (independant, liberal, tpe) while keeping legacy values.
*/

ALTER TABLE diagnostic_completions
  DROP CONSTRAINT IF EXISTS diagnostic_completions_profile_type_check;

ALTER TABLE diagnostic_completions
  ADD CONSTRAINT diagnostic_completions_profile_type_check
  CHECK (profile_type IN ('boutique', 'solo', 'equipe', 'independant', 'liberal', 'tpe'));
