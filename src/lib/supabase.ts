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

export interface Resource {
  id: string;
  theme_id: string;
  title: string;
  description: string;
  type: 'pdf' | 'audio' | 'video' | 'link' | 'image';
  resource_type_id: string;
  file_format?: 'pdf' | 'image' | 'video' | 'audio' | 'external_link' | null;
  url: string;
  tags: string[];
  duration?: number | null;
  created_at: string;
  updated_at: string;
  theme?: Theme;
  resource_type?: ResourceType;
  isPinned?: boolean;
}
