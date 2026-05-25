/** Extrait un message lisible (Supabase PostgrestError, Error, etc.). */
export function formatAppError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.length > 0) {
      const details = typeof record.details === 'string' ? record.details : '';
      const hint = typeof record.hint === 'string' ? record.hint : '';
      return [record.message, details, hint].filter(Boolean).join(' — ');
    }
  }
  return 'Erreur inconnue';
}
