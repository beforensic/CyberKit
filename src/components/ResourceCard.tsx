import { BookOpen, Download, ExternalLink, Eye, FileText, Headphones, Image as ImageIcon, MessageCircle, CheckCircle2 } from 'lucide-react';
import ResourcePreviewModal from './ResourcePreviewModal';
import ResourcePreviewMedia, { hasCardThumbnail } from './ResourcePreviewMedia';
import { useNavigate } from 'react-router-dom';
import { Resource } from '../lib/supabase';
import { toggleFavorite, getFavorites } from '../utils/storage';
import { useState, useEffect } from 'react';
import KeywordTooltip from './KeywordTooltip';
import { useProgress } from '../contexts/ProgressContext';

interface ResourceCardProps {
  resource: Resource & { theme?: { title: string } };
}

// Dictionnaire pour traduire les types techniques en labels propres
const TYPE_LABELS: Record<string, string> = {
  guide: 'Guide',
  memo: 'Mémo',
  infographie: 'Infographie',
  podcast: 'Podcast',
  image: 'Image',
  link: 'Lien externe'
};

export default function ResourceCard({ resource }: ResourceCardProps) {
  const navigate = useNavigate();
  const { markAsConsulted, isConsulted } = useProgress();
  const [isFavorite, setIsFavorite] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const consulted = isConsulted(resource.id);
  const showThumbnail = hasCardThumbnail(resource);

  const openPreview = () => {
    markAsConsulted(resource.id);
    setPreviewOpen(true);
  };

  useEffect(() => {
    const favorites = getFavorites();
    setIsFavorite(favorites.includes(resource.id));
  }, [resource.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleFavorite(resource.id);
    setIsFavorite(newState);
  };

  // Sélection de l'icône selon le type
  const getIcon = () => {
    switch (resource.type) {
      case 'podcast':
      case 'audio':
        return <Headphones className="w-6 h-6" />;
      case 'infographie':
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'memo':
      case 'pdf':
      case 'guide':
        return <FileText className="w-6 h-6" />;
      case 'link':
        return <ExternalLink className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-white rounded-card p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-brand-orange/5 transition-all group relative flex flex-col h-full text-left overflow-hidden">
      <div className={`flex justify-end ${showThumbnail ? 'absolute top-6 right-6 z-10' : 'mb-6'}`}>
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isFavorite}
          className={`focus-ring p-2 rounded-full transition-colors shadow-sm ${
            showThumbnail
              ? 'bg-white/90 backdrop-blur-sm ' + (isFavorite ? 'text-red-500' : 'text-slate-400 hover:text-red-500')
              : isFavorite
                ? 'text-red-500 bg-red-50'
                : 'text-slate-200 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <svg aria-hidden="true" className={`w-6 h-6 ${isFavorite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.364-1.364a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {showThumbnail ? (
        <button type="button" onClick={openPreview} className="focus-ring w-full text-left -mt-2 mb-4">
          <ResourcePreviewMedia resource={resource} variant="card" />
        </button>
      ) : (
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-orange-50 group-hover:text-brand-orange transition-colors mb-6">
          {getIcon()}
        </div>
      )}

      <div className="flex-1">
        {/* Affichage du TYPE et du THÈME */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-3 py-1 bg-brand-orange-50 text-brand-orange rounded-full text-xs font-semibold border border-brand-orange-100">
            {TYPE_LABELS[resource.type || ''] || 'Ressource'}
          </span>
          {consulted && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-orange-50 text-brand-orange-700 rounded-full text-xs font-semibold border border-brand-orange-100">
              <CheckCircle2 size={12} aria-hidden="true" />
              Consulté
            </span>
          )}
          {resource.theme?.title && (
            <span className="text-xs font-medium text-slate-400">
              • {resource.theme.title}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={openPreview}
          className="focus-ring text-left w-full mb-3 rounded-lg -mx-1 px-1 cursor-pointer"
        >
          <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-brand-orange transition-colors underline-offset-2 hover:underline">
            {resource.title}
          </h3>
        </button>
        <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
          {resource.description}
        </p>

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {resource.tags.slice(0, 4).map((tag) => (
              <KeywordTooltip key={tag} keyword={tag}>
                <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-slate-200 cursor-help hover:border-brand-orange/40 hover:text-brand-orange transition-colors">
                  {tag}
                </span>
              </KeywordTooltip>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 mt-auto">
        <button
          type="button"
          onClick={openPreview}
          className="focus-ring w-full py-4 bg-brand-orange-50 text-brand-orange rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-brand-orange hover:bg-brand-orange hover:text-white transition-all shadow-sm shadow-brand-orange/10"
        >
          <Eye size={18} aria-hidden="true" />
          Aperçu
        </button>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => markAsConsulted(resource.id)}
          className="focus-ring w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-brand-orange hover:text-brand-orange transition-all"
        >
          {resource.type === 'link' ? <ExternalLink size={18} aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
          {resource.type === 'link' ? 'Consulter' : 'Télécharger'}
          <span className="sr-only"> (nouvel onglet)</span>
        </a>

        <button
          type="button"
          onClick={() => navigate(`/contact?subject=${encodeURIComponent(`Question sur : ${resource.title}`)}`)}
          className="focus-ring w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium"
        >
          <MessageCircle size={14} aria-hidden="true" /> Besoin d'aide sur ce sujet ?
        </button>
      </div>

      <ResourcePreviewModal
        resource={resource}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onDownload={() => markAsConsulted(resource.id)}
      />
    </div>
  );
}