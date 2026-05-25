import { Theme } from '../lib/supabase';
import type { ResourceWithTheme } from '../services/catalog';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalizeThemeKey = (value: string) =>
  value.normalize('NFC').trim().toLocaleLowerCase('fr');

export function resolveThemeFromParam(param: string | null, themes: Theme[]): Theme | null {
  if (!param || themes.length === 0) return null;

  const decoded = decodeURIComponent(param).trim();
  const normalized = normalizeThemeKey(decoded);
  const lowerDecoded = decoded.toLowerCase();

  if (UUID_REGEX.test(decoded)) {
    const byId = themes.find((theme) => theme.id.toLowerCase() === lowerDecoded);
    if (byId) return byId;
  }

  return (
    themes.find((theme) => theme.slug?.toLowerCase() === lowerDecoded) ??
    themes.find((theme) => normalizeThemeKey(theme.title) === normalized) ??
    null
  );
}

/** Resolves theme id from URL param, router state, or legacy title/slug strings. */
export function resolveThemeId(
  param: string | null,
  stateThemeId: string | null | undefined,
  themes: Theme[]
): string | null {
  if (stateThemeId && UUID_REGEX.test(stateThemeId)) {
    const fromState = themes.find((t) => t.id.toLowerCase() === stateThemeId.toLowerCase());
    if (fromState) return fromState.id;
    if (themes.length === 0) return stateThemeId;
  }

  const fromParam = resolveThemeFromParam(param, themes);
  return fromParam?.id ?? null;
}

export function resourceMatchesThemeId(
  resource: ResourceWithTheme,
  themeId: string | null
): boolean {
  if (!themeId) return true;
  if (!resource.theme_id) return false;
  return resource.theme_id.toLowerCase() === themeId.toLowerCase();
}

export function themeToSearchParam(theme: Theme): string {
  return theme.id;
}
