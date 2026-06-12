/** Configuration Matomo optionnelle (activée uniquement si les deux variables sont définies). */
export function getMatomoConfig(): { siteId: string; host: string } | null {
  const siteId = import.meta.env.VITE_MATOMO_SITE_ID?.trim();
  const matomoUrl = import.meta.env.VITE_MATOMO_URL?.trim();

  if (!siteId || !matomoUrl) return null;

  const host = matomoUrl.endsWith('/') ? matomoUrl : `${matomoUrl}/`;

  return { siteId, host };
}
