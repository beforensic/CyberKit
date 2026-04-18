import { BookOpen, Download, ExternalLink, FileText, Headphones, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { Resource } from '../lib/supabase';
import { toggleFavorite, getFavorites } from '../utils/storage';
import { useState, useEffect } from 'react';

interface ResourceCardProps {
  resource: Resource & { theme?: { title: string } };
  onNavigate: (page: any, data?: any) => void;
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

export default function ResourceCard({ resource, onNavigate }: ResourceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

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
      case 'podcast': return <Headphones className="w-6 h-6" />;
      case 'infographie': return <ImageIcon className="w-6 h-6" />;
      case 'memo': return <FileText className="w-6 h-6" />;
      case 'link': return <ExternalLink className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all group relative flex flex-col h-full text-left">
      {/* En-tête de la carte */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-[#E8650A] transition-colors">
          {getIcon()}
        </div>
        <button
          onClick={handleToggleFavorite}
          className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-slate-200 hover:text-red-500 hover:bg-red-50'}`}
        >
          <svg className={`w-6 h-6 ${isFavorite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.364-1.364a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="flex-1">
        {/* Affichage du TYPE et du THÈME */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-orange-50 text-[#E8650A] rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
            {TYPE_LABELS[resource.type || ''] || 'Ressource'}
          </span>
          {resource.theme?.title && (
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              • {resource.theme.title}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-[#E8650A] transition-colors">
          {resource.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">
          {resource.description}
        </p>
      </div>

      <div className="space-y-4 mt-auto">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-white border-2 border-[#E8650A] text-[#E8650A] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#E8650A] hover:text-white transition-all shadow-sm"
        >
          {resource.type === 'link' ? <ExternalLink size={18} /> : <Download size={18} />}
          {resource.type === 'link' ? 'Consulter' : 'Télécharger'}
        </a>

        <button
          onClick={() => onNavigate('contact', { subject: `Question sur : ${resource.title}` })}
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium"
        >
          <MessageCircle size={14} /> Besoin d'aide sur ce sujet ?
        </button>
      </div>
    </div>
  );
}