import { ResourceKind, supabase } from '../lib/supabase';

const PEDAGOGICAL_TO_RESOURCE_TYPE_NAME: Partial<Record<ResourceKind, string>> = {
  guide: 'Guide',
  memo: 'Mémo',
  infographie: 'Infographie',
  podcast: 'Audio',
  image: 'Infographie',
  link: 'Lien externe',
  pdf: 'Guide',
  audio: 'Audio',
  video: 'Vidéo',
};

/** Valeurs acceptées par l'enum `resource_type` en base. */
const PEDAGOGICAL_TO_DB_ENUM: Partial<Record<ResourceKind, string>> = {
  guide: 'pdf',
  memo: 'pdf',
  infographie: 'image',
  podcast: 'audio',
  image: 'image',
  link: 'link',
  pdf: 'pdf',
  audio: 'audio',
  video: 'video',
};

export async function resolveResourceTypeId(kind: ResourceKind): Promise<string | null> {
  const name = PEDAGOGICAL_TO_RESOURCE_TYPE_NAME[kind];
  if (!name) return null;

  const { data, error } = await supabase
    .from('resource_types')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export function toDbResourceType(kind: ResourceKind): string {
  return PEDAGOGICAL_TO_DB_ENUM[kind] ?? 'pdf';
}

export type ResourceFormPayload = {
  title: string;
  description: string | null;
  url: string;
  theme_id: string;
  preview_image_url: string | null;
};

export function toResourceFormPayload(data: {
  title: string;
  description: string;
  url: string;
  theme_id: string;
  preview_image_url: string;
}): ResourceFormPayload {
  const description = data.description.trim();
  const preview = data.preview_image_url.trim();
  return {
    title: data.title.trim(),
    description: description.length > 0 ? description : null,
    url: data.url.trim(),
    theme_id: data.theme_id,
    preview_image_url: preview.length > 0 ? preview : null,
  };
}

export async function uploadToResourcesBucket(file: File, folder: 'files' | 'previews'): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const fileName = `${folder}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from('resources').upload(fileName, file);
  if (uploadError) throw uploadError;
  const {
    data: { publicUrl },
  } = supabase.storage.from('resources').getPublicUrl(fileName);
  return publicUrl;
}
