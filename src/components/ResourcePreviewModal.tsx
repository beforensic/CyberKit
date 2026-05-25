import { useEffect, useRef } from 'react';
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Headphones,
  Image as ImageIcon,
  MessageCircle,
  X,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Resource, ResourceKind } from '../lib/supabase';
import KeywordTooltip from './KeywordTooltip';
import ResourcePreviewMedia from './ResourcePreviewMedia';

const TYPE_LABELS: Record<string, string> = {
  guide: 'Guide',
  memo: 'Mémo',
  infographie: 'Infographie',
  podcast: 'Podcast',
  image: 'Image',
  link: 'Lien externe',
  pdf: 'PDF',
  audio: 'Audio',
  video: 'Vidéo',
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

function ResourceTypeIcon({ type }: { type: ResourceKind | string | undefined }) {
  switch (type) {
    case 'podcast':
    case 'audio':
      return <Headphones className="w-7 h-7" aria-hidden="true" />;
    case 'infographie':
    case 'image':
      return <ImageIcon className="w-7 h-7" aria-hidden="true" />;
    case 'memo':
    case 'pdf':
    case 'guide':
      return <FileText className="w-7 h-7" aria-hidden="true" />;
    case 'link':
      return <ExternalLink className="w-7 h-7" aria-hidden="true" />;
    default:
      return <BookOpen className="w-7 h-7" aria-hidden="true" />;
  }
}

interface ResourcePreviewModalProps {
  resource: Resource & { theme?: { title: string } };
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export default function ResourcePreviewModal({
  resource,
  isOpen,
  onClose,
  onDownload,
}: ResourcePreviewModalProps) {
  const navigate = useNavigate();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = `resource-preview-title-${resource.id}`;
  const descId = `resource-preview-desc-${resource.id}`;

  const typeLabel = TYPE_LABELS[resource.type || ''] || 'Ressource';
  const isExternalLink = resource.type === 'link';
  const description = resource.description?.trim();

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleContact = () => {
    onClose();
    navigate(`/contact?subject=${encodeURIComponent(`Question sur : ${resource.title}`)}`);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-start gap-4 bg-slate-50 shrink-0">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-orange border border-brand-orange/10 shrink-0">
              <ResourceTypeIcon type={resource.type} />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-brand-orange-50 text-brand-orange rounded-full text-xs font-semibold border border-brand-orange-100">
                  {typeLabel}
                </span>
                {resource.theme?.title && (
                  <span className="text-xs font-medium text-slate-400">• {resource.theme.title}</span>
                )}
                {resource.duration != null && resource.duration > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Clock size={12} aria-hidden="true" />
                    {formatDuration(resource.duration)}
                  </span>
                )}
              </div>
              <h2 id={titleId} className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {resource.title}
              </h2>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer l'aperçu"
            className="focus-ring p-2 hover:bg-white rounded-full transition-colors text-slate-400 shrink-0"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-left">
          <ResourcePreviewMedia resource={resource} variant="modal" />

          <p id={descId} className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {description || (
              <span className="text-slate-400 italic">
                Aucune description disponible pour cette ressource. Utilisez le téléchargement pour consulter le
                contenu complet.
              </span>
            )}
          </p>

          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {resource.tags.map((tag) => (
                <KeywordTooltip key={tag} keyword={tag}>
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-slate-200 cursor-help hover:border-brand-orange/40 hover:text-brand-orange transition-colors">
                    {tag}
                  </span>
                </KeywordTooltip>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 border-t border-slate-100 bg-white shrink-0 space-y-3">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              onDownload?.();
              onClose();
            }}
            className="focus-ring w-full py-4 bg-brand-orange text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-orange-600 transition-all shadow-lg shadow-brand-orange/20"
          >
            {isExternalLink ? <ExternalLink size={18} aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
            {isExternalLink ? 'Consulter' : 'Télécharger'}
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          <button
            type="button"
            onClick={handleContact}
            className="focus-ring w-full py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Besoin d&apos;aide sur ce sujet ?
          </button>
        </div>
      </div>
    </div>
  );
}
