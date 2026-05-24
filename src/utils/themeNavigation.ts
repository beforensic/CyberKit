import { Theme } from '../lib/supabase';

const normalizeThemeKey = (value: string) =>
  value.normalize('NFC').trim().toLocaleLowerCase('fr');

export function resolveThemeFromParam(param: string | null, themes: Theme[]): Theme | null {
  if (!param || themes.length === 0) return null;

  const decoded = decodeURIComponent(param);
  const normalized = normalizeThemeKey(decoded);

  return (
    themes.find((theme) => theme.id === decoded) ??
    themes.find((theme) => theme.slug === decoded) ??
    themes.find((theme) => normalizeThemeKey(theme.title) === normalized) ??
    null
  );
}

export function themeToSearchParam(theme: Theme): string {
  return theme.slug;
}
