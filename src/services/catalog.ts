import { supabase, Theme, Resource } from '../lib/supabase';

export type ResourceWithTheme = Resource & {
  theme?: { title: string; slug?: string } | null;
};

export async function fetchThemes(): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false });

  if (error) {
    const fallback = await supabase.from('themes').select('*').order('title');
    if (fallback.error) throw fallback.error;
    return fallback.data ?? [];
  }

  return data ?? [];
}

export async function fetchResources(): Promise<ResourceWithTheme[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('*, theme:themes(title, slug)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResourceWithTheme[];
}
