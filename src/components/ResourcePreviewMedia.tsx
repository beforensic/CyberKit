import { Resource } from '../lib/supabase';
import {
  getResourcePreviewImageUrl,
  shouldShowAudioPreview,
} from '../utils/resourcePreview';

interface ResourcePreviewMediaProps {
  resource: Pick<Resource, 'preview_image_url' | 'url' | 'type' | 'title'>;
  variant?: 'card' | 'modal';
}

export default function ResourcePreviewMedia({
  resource,
  variant = 'modal',
}: ResourcePreviewMediaProps) {
  const imageUrl = getResourcePreviewImageUrl(resource);
  const showAudio = !imageUrl && shouldShowAudioPreview(resource);

  if (!imageUrl && !showAudio) return null;

  if (imageUrl) {
    const isCard = variant === 'card';
    return (
      <div
        className={
          isCard
            ? 'relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100'
            : 'mb-6 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100'
        }
      >
        <img
          src={imageUrl}
          alt={`Aperçu : ${resource.title}`}
          className={
            isCard
              ? 'w-full h-full object-cover object-top'
              : 'w-full max-h-[min(50vh,420px)] object-contain object-center mx-auto'
          }
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl bg-slate-50 border border-slate-100 p-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
        Écouter un extrait
      </p>
      <audio controls className="w-full" preload="metadata" src={resource.url}>
        Votre navigateur ne prend pas en charge la lecture audio.
      </audio>
    </div>
  );
}

/** Indique si la carte peut afficher une vignette image. */
export function hasCardThumbnail(
  resource: Pick<Resource, 'preview_image_url' | 'url' | 'type'>
): boolean {
  return getResourcePreviewImageUrl(resource) !== null;
}
