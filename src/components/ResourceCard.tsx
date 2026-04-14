import { useState, useEffect } from 'react';
import { FileText, PlayCircle, Headphones, ExternalLink, Image, Download, Clock, Heart, Check } from 'lucide-react';
import { Resource, supabase } from '../lib/supabase';
import ResourceError from './ResourceError';
import KeywordTooltip from './KeywordTooltip';
import AudioPlayer from './AudioPlayer';
import { getFavorites, toggleFavorite } from '../utils/storage';
import { useProgress } from '../contexts/ProgressContext';

interface ResourceCardProps {
  resource: Resource;
  typeColor?: string;
  typeName?: string;
  onNavigateToContact?: () => void;
  onFavoriteChange?: () => void;
}

export default function ResourceCard({ resource, typeColor, typeName, onNavigateToContact, onFavoriteChange }: ResourceCardProps) {
  const [showError, setShowError] = useState(false);
  const [showReportButton, setShowReportButton] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const { markAsConsulted, isConsulted } = useProgress();

  useEffect(() => {
    const favorites = getFavorites();
    setIsFavorite(favorites.includes(resource.id));
  }, [resource.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleFavorite(resource.id);
    setIsFavorite(newState);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 300);
    if (onFavoriteChange) {
      onFavoriteChange();
    }
  };
  const getResourceStyle = () => {
    switch (resource.type) {
      case 'pdf':
        return {
          borderColor: 'border-l-slate-900',
          iconColor: 'text-slate-900',
          icon: FileText,
          buttonText: 'Télécharger le PDF',
          buttonBg: 'bg-accent hover:bg-accent-600 text-white'
        };
      case 'image':
        return {
          borderColor: 'border-l-purple-500',
          iconColor: 'text-purple-500',
          icon: Image,
          buttonText: 'Télécharger',
          buttonBg: 'bg-purple-500 hover:bg-purple-600 text-white'
        };
      case 'video':
        return {
          borderColor: 'border-l-sky-500',
          iconColor: 'text-sky-500',
          icon: PlayCircle,
          buttonText: 'Voir la vidéo',
          buttonBg: 'bg-sky-500 hover:bg-sky-600 text-white'
        };
      case 'audio':
        return {
          borderColor: 'border-l-slate-400',
          iconColor: 'text-slate-400',
          icon: Headphones,
          buttonText: 'Écouter l\'audio',
          buttonBg: 'bg-slate-400 hover:bg-slate-500 text-white'
        };
      case 'link':
        return {
          borderColor: 'border-l-primary',
          iconColor: 'text-primary',
          icon: ExternalLink,
          buttonText: 'Visiter le site',
          buttonBg: 'bg-accent hover:bg-accent-600 text-white'
        };
      default:
        return {
          borderColor: 'border-l-primary',
          iconColor: 'text-primary',
          icon: ExternalLink,
          buttonText: 'Ouvrir',
          buttonBg: 'bg-accent hover:bg-accent-600 text-white'
        };
    }
  };

  const style = getResourceStyle();
  const Icon = style.icon;

  const handleOpen = async () => {
    if (!resource.url || resource.url.trim() === '') {
      setShowError(true);
      return;
    }

    markAsConsulted(resource.id);

    try {
      await supabase
        .from('resource_views')
        .insert({
          resource_id: resource.id,
          resource_type: resource.type
        });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la consultation:', error);
    }

    if (resource.type === 'audio') {
      setShowAudioPlayer(true);
      return;
    }

    try {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      setShowReportButton(true);
      setTimeout(() => setShowReportButton(false), 10000);
    } catch (error) {
      setShowError(true);
    }
  };

  const handleReportBrokenLink = () => {
    setShowError(true);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleContactAdmin = () => {
    setShowError(false);
    if (onNavigateToContact) {
      onNavigateToContact();
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const shouldShowDuration = (resource.type === 'audio' || resource.type === 'video') && resource.duration && resource.duration > 0;
  const consulted = isConsulted(resource.id);

  return (
    <>
      {showAudioPlayer && (
        <AudioPlayer
          url={resource.url}
          title={resource.title}
          onClose={() => setShowAudioPlayer(false)}
        />
      )}

      {showError && (
        <ResourceError
          resourceTitle={resource.title}
          onBack={handleCloseError}
          onContactAdmin={handleContactAdmin}
        />
      )}

      <div className={`bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden relative ${consulted ? 'opacity-85' : ''}`}>
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-4 left-4 z-10 p-2 rounded-full bg-white shadow-md hover:scale-110 transition-all ${isPulsing ? 'animate-pulse' : ''}`}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            className={`w-5 h-5 transition-all ${isFavorite ? 'fill-[#E8650A] text-[#E8650A]' : 'text-gray-400'}`}
          />
        </button>

        <div className="p-6 pt-14">
          <div className="flex items-center justify-between mb-4">
            {resource.theme?.title ? (
              <span className="text-xs text-slate-600">
                {resource.theme.title}
              </span>
            ) : (
              <span></span>
            )}
            {typeColor && typeName && (
              <span
                className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                style={{ backgroundColor: typeColor }}
              >
                {typeName}
              </span>
            )}
          </div>

          {resource.type === 'image' && resource.url && (
            <div className="w-full bg-slate-50 -mx-6 mb-4">
              <img
                src={resource.url}
                alt={resource.title}
                className="w-full h-auto object-contain"
                onError={() => setShowError(true)}
              />
            </div>
          )}

          <div className="flex items-start mb-3">
            <Icon className={`w-8 h-8 ${style.iconColor}`} />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
            {resource.title}
          </h3>

          {resource.isPinned && (
            <div className="mb-2">
              <span className="inline-block bg-[#E8650A] text-white text-xs font-bold px-2 py-1 rounded">
                Essentiel
              </span>
            </div>
          )}

          {shouldShowDuration && (
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(resource.duration!)}</span>
            </div>
          )}

          <p className="text-slate-600 text-sm mb-4 line-clamp-3">
            {resource.description}
          </p>

          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {resource.tags.slice(0, 3).map((tag) => (
                <KeywordTooltip key={tag} keyword={tag}>
                  <div className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md cursor-help">
                    {tag}
                  </div>
                </KeywordTooltip>
              ))}
              {resource.tags.length > 3 && (
                <div className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                  +{resource.tags.length - 3}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleOpen}
            className={`w-full ${style.buttonBg} py-3 rounded-lg font-semibold transition-all active:scale-95 flex items-center justify-center gap-2`}
          >
            {resource.type === 'image' ? <Download className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
            {style.buttonText}
          </button>

          {showReportButton && (
            <button
              onClick={handleReportBrokenLink}
              className="w-full mt-2 py-2 bg-orange-50 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-100 transition-all flex items-center justify-center gap-1 border border-orange-200"
            >
              Signaler un problème
            </button>
          )}
        </div>

        {consulted && (
          <div
            className="absolute bottom-4 left-4 bg-emerald-500 text-white rounded-full p-1.5 shadow-md"
            title="Ressource consultée"
          >
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>
    </>
  );
}
