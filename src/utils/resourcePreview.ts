import { Resource, ResourceKind } from '../lib/supabase';

const IMAGE_URL_PATTERN = /\.(png|jpe?g|webp|gif|svg|bmp)(\?|#|$)/i;
const AUDIO_URL_PATTERN = /\.(mp3|m4a|wav|ogg|aac)(\?|#|$)/i;

const VISUAL_TYPES: ResourceKind[] = ['infographie', 'image'];
const AUDIO_TYPES: ResourceKind[] = ['podcast', 'audio'];

export function isLikelyImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  return IMAGE_URL_PATTERN.test(trimmed);
}

export function isLikelyAudioUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  return AUDIO_URL_PATTERN.test(trimmed);
}

/** URL d'image pour vignette / modal (preview dédiée ou fichier image principal). */
export function getResourcePreviewImageUrl(
  resource: Pick<Resource, 'preview_image_url' | 'url' | 'type'>
): string | null {
  const dedicated = resource.preview_image_url?.trim();
  if (dedicated) return dedicated;

  const type = resource.type;
  if (VISUAL_TYPES.includes(type) && resource.url && isLikelyImageUrl(resource.url)) {
    return resource.url.trim();
  }

  return null;
}

export function shouldShowAudioPreview(
  resource: Pick<Resource, 'url' | 'type'>
): boolean {
  if (!resource.url?.trim()) return false;
  if (!AUDIO_TYPES.includes(resource.type)) return false;
  return isLikelyAudioUrl(resource.url);
}
