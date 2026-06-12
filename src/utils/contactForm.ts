export const MIN_SUBMIT_DELAY_MS = 3000;

export type ContactValidationError = 'too_fast' | 'gdpr_required' | 'honeypot';

export function validateContactSubmission(params: {
  formLoadedAt: number;
  now?: number;
  gdprConsent: boolean;
  website: string;
}): ContactValidationError | null {
  const now = params.now ?? Date.now();

  if (now - params.formLoadedAt < MIN_SUBMIT_DELAY_MS) {
    return 'too_fast';
  }

  if (!params.gdprConsent) {
    return 'gdpr_required';
  }

  if (params.website.trim().length > 0) {
    return 'honeypot';
  }

  return null;
}

export function getContactValidationMessage(error: ContactValidationError): string {
  switch (error) {
    case 'too_fast':
      return "Veuillez patienter quelques secondes avant d'envoyer.";
    case 'gdpr_required':
      return 'Vous devez accepter le traitement de vos données pour envoyer le message.';
    case 'honeypot':
      return "Désolé, l'envoi a échoué. Veuillez réessayer ou utiliser l'email direct.";
  }
}
