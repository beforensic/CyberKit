import { useState, useEffect } from 'react';
import {
  FileText, PlayCircle, Headphones, ExternalLink, Image as ImageIcon,
  Download, Clock, Heart, Check, Star
} from 'lucide-react';
import { Resource, supabase } from '../lib/supabase';
import ResourceError from './ResourceError';
import KeywordTooltip from './KeywordTooltip';
import AudioPlayer from './AudioPlayer';
import { getFavorites, toggleFavorite } from '../utils/storage';
import { useProgress } from '../contexts/ProgressContext';

interface ResourceCardProps {
  resource: Resource & { isPinned?: boolean };
  typeColor?: string;
  typeName?: string;
  onNavigateToContact?: () => void;
}

export default function ResourceCard({ resource, typeColor, typeName, onNavigateToContact }: ResourceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const { progress } = useProgress();

  // Vérification si la ressource est déjà complétée (progression)
  const isCompleted = progress.some(p => p.resourceId === resource.id);

  useEffect(() => {
    const favorites = getFavorites();
    setIsFavorite(favorites.includes(resource.id));
  }, [resource.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = toggleFavorite(resource.id);
    setIsFavorite(newStatus);
  };

  const getIcon = () => {
    switch (resource.type) {
      case 'video': return <PlayCircle className="w-8 h-8" />;
      case 'audio': return <Headphones className="w-8 h-8" />;
      case 'image': return <ImageIcon className="w-8 h-8" />;
      case 'link': return <ExternalLink className="w-8 h-8" />;
      default: return <FileText className="w-8 h-8" />;
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (resource.type === 'audio') {
      setShowAudioPlayer(!showAudioPlayer);
      return;
    }
    window.open(resource.url, '_blank');
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col h-full hover:shadow-md hover:border-slate-300 transition-all duration-300 relative">

      {/* Badge "Essentiel" (Nouveau style) */}
      {resource.is_pinned && (
        <div className="absolute top-0 right-0 bg-orange-100 text-[#E8650A] px-3 py-1 rounded-bl-xl flex items-center gap-1.5 z-10">
          <Star className="w-3.5 h-3.5 fill-[#E8650A]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Essentiel</span>
        </div>
      )}

      {/* En-tête : Icône et Favoris */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-xl text-slate-700 group-hover:bg-slate-100 transition-colors">
          {getIcon()}
        </div>
        <div className="flex gap-2">
          {isCompleted && (
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-full" title="Déjà consulté">
              <Check className="w-5 h-5" />
            </div>
          )}
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-all ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300 hover:text-red-400'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Badge Type */}
      {typeName && (
        <div className="mb-3">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide"
            style={{
              color: typeColor || '#64748B',
              borderColor: `${typeColor}40` || '#E2E8F0',
              backgroundColor: `${typeColor}10` || '#F8FAFC'
            }}
          >
            {typeName}
          </span>
        </div>
      )}

      {/* Corps : Titre Semibold (Adouci) */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-[#E8650A] transition-colors">
          {resource.title}
        </h3>
        {resource.description && (
          <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>

      {/* Tags avec Tooltip possible */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {resource.tags.slice(0, 3).map((tag) => (
            <KeywordTooltip key={tag} keyword={tag}>
              <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md cursor-help hover:bg-slate-200 transition-colors">
                #{tag}
              </span>
            </KeywordTooltip>
          ))}
        </div>
      )}

      {/* Lecteur Audio Intégré */}
      {showAudioPlayer && resource.type === 'audio' && (
        <div className="mb-4 p-2 bg-slate-50 rounded-lg border border-slate-100">
          <AudioPlayer url={resource.url} />
        </div>
      )}

      {/* Action principale : Bouton Outline */}
      <button
        onClick={handleAction}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border-2 border-[#E8650A] text-[#E8650A] bg-white hover:bg-[#E8650A] hover:text-white transition-all duration-300 shadow-sm active:scale-95"
      >
        {resource.type === 'link' ? (
          <>Consulter le lien <ExternalLink className="w-4 h-4" /></>
        ) : resource.type === 'audio' ? (
          <>{showAudioPlayer ? 'Fermer le lecteur' : 'Écouter la ressource'} <Headphones className="w-4 h-4" /></>
        ) : (
          <>Télécharger <Download className="w-4 h-4" /></>
        )}
      </button>

      {onNavigateToContact && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigateToContact(); }}
          className="mt-4 text-[11px] text-slate-400 hover:text-[#E8650A] underline underline-offset-4 text-center transition-colors font-medium"
        >
          Besoin d'accompagnement sur ce sujet ?
        </button>
      )}
    </div>
  );
}