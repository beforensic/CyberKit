import { Theme } from '../lib/supabase';
import type { ResourceWithTheme } from '../services/catalog';

const normalizeThemeKey = (value: string) =>
  value.normalize('NFC').trim().toLocaleLowerCase('fr');

export function resolveThemeFromParam(param: string | null, themes: Theme[]): Theme | null {
  if (!param || themes.length === 0) return null;

  const decoded = decodeURIComponent(param).trim();
  const normalized = normalizeThemeKey(decoded);
  const lowerDecoded = decoded.toLowerCase();

  return (
    themes.find((theme) => theme.id === decoded) ??
    themes.find((theme) => theme.slug?.toLowerCase() === lowerDecoded) ??
    themes.find((theme) => normalizeThemeKey(theme.title) === normalized) ??
    null
  );
}

export function resourceBelongsToTheme(resource: ResourceWithTheme, theme: Theme | null): boolean {
  if (!theme) return true;

  if (resource.theme_id?.toLowerCase() === theme.id.toLowerCase()) {
    return true;
  }

  const joinedTheme = resource.theme as { title?: string; slug?: string } | null | undefined;
  if (joinedTheme?.slug && joinedTheme.slug.toLowerCase() === theme.slug.toLowerCase()) {
    return true;
  }

  if (joinedTheme?.title && normalizeThemeKey(joinedTheme.title) === normalizeThemeKey(theme.title)) {
    return true;
  }

  return false;
}

export function themeToSearchParam(theme: Theme): string {
  return theme.id;
}
