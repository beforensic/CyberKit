import { supabase, Theme, Resource } from '../lib/supabase';

export type ResourceWithTheme = Resource & {
  theme?: { title: string } | null;
};

export async function fetchThemes(): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchResources(): Promise<ResourceWithTheme[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('*, theme:themes(title)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResourceWithTheme[];
}
