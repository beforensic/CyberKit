/*
  Preuve de consentement RGPD pour les envois du formulaire de contact.
*/

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS gdpr_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS gdpr_consent_version text;

COMMENT ON COLUMN public.contact_messages.gdpr_consent_at IS
  'Horodatage du consentement explicite au traitement des données (formulaire contact).';

COMMENT ON COLUMN public.contact_messages.gdpr_consent_version IS
  'Version de la politique de confidentialité acceptée (ex. 2026-03).';
