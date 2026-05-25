/*
  # Retrait espace entreprise / abonnements

  CyberKit reste 100 % gratuit (indépendants & TPE).
  La conversion vers l'offre payante beForensic passe par Contact / À propos, pas par Stripe in-app.

  Supprime si présentes :
  - tables companies, company_members, company_diagnostics
  - fonction validate_invitation_code
*/

DROP FUNCTION IF EXISTS public.validate_invitation_code(text);

DROP TABLE IF EXISTS public.company_diagnostics CASCADE;
DROP TABLE IF EXISTS public.company_members CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
