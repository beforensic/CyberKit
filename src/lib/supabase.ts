import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Theme {
  id: string;
  title: string;
  description: string;
  slug: string;
  icon_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceType {
  id: string;
  name: string;
  technical_type: string;
  description: string;
  icon_name: string;
  color: string;
  order: number;
  created_at: string;
}

/** Valeurs utilisées en prod (admin + bibliothèque) et legacy seed/migrations. */
export type ResourceKind =
  | 'guide'
  | 'memo'
  | 'infographie'
  | 'podcast'
  | 'image'
  | 'link'
  | 'pdf'
  | 'audio'
  | 'video';

export interface ThemeSummary {
  id: string;
  title: string;
}

export interface AdminQuestionRow {
  id: string;
  text: string;
  points: number;
  quiz_profiles: { name: string } | { name: string }[] | null;
}

export function getQuestionProfileName(
  profiles: AdminQuestionRow['quiz_profiles']
): string {
  if (!profiles) return 'Générique';
  if (Array.isArray(profiles)) return profiles[0]?.name ?? 'Générique';
  return profiles.name;
}

export interface Resource {
  id: string;
  theme_id: string;
  title: string;
  description: string | null;
  type: ResourceKind;
  resource_type_id: string;
  url: string;
  preview_image_url?: string | null;
  tags: string[];
  duration?: number | null;
  created_at: string;
  updated_at: string;
  theme?: Theme;
  resource_type?: ResourceType;
  is_pinned: boolean; // Corrigé ici pour correspondre à la DB
}