import { useState, useEffect } from 'react';
import { FileText, PlayCircle, Headphones, ExternalLink, Image, Download, Heart, Check, Star, MessageCircle } from 'lucide-react';
import { Resource } from '../lib/supabase';
import AudioPlayer from './AudioPlayer';
import { getFavorites, toggleFavorite } from '../utils/storage';
import { useProgress } from '../contexts/ProgressContext';

interface ResourceCardProps {
  resource: Resource;
  typeColor?: string;
  typeName?: string;
  onNavigateToContact?: () => void;
}

export default function ResourceCard({ resource, typeColor, typeName, onNavigateToContact }: ResourceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const { progress } = useProgress();
  const isCompleted = progress.some(p => p.resourceId === resource.id);

  useEffect(() => {
    setIsFavorite(getFavorites().includes(resource.id));
  }, [resource.id]);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (resource.type === 'audio') { setShowAudioPlayer(!showAudioPlayer); return; }
    window.open(resource.url, '_blank');
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col h-full hover:shadow-md transition-all relative overflow-hidden">
      {resource.is_pinned && (
        <div className="absolute top-0 right-0 bg-orange-100 text-[#E8650A] px-3 py-1 rounded-bl-xl flex items-center gap-1 z-20 shadow-sm border-l border-b border-orange-200">
          <Star className="w-3 h-3 fill-[#E8650A]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Essentiel</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-xl text-slate-700">{resource.type === 'video' ? <PlayCircle /> : <FileText />}</div>
        <div className={`flex gap-2 z-10 ${resource.is_pinned ? 'mr-20' : ''}`}>
          {isCompleted && <div className="p-2 bg-emerald-50 text-emerald-500 rounded-full"><Check className="w-5 h-5" /></div>}
          <button onClick={(e) => { e.stopPropagation(); setIsFavorite(toggleFavorite(resource.id)); }} className={`p-2 rounded-full border ${isFavorite ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-slate-300'}`}><Heart className={isFavorite ? 'fill-current' : ''} /></button>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-800 mb-2 leading-snug group-hover:text-[#E8650A] transition-colors">{resource.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-3 mb-4">{resource.description}</p>
      </div>

      <button onClick={handleAction} className="w-full py-3 px-4 rounded-xl font-bold text-sm border-2 border-[#E8650A] text-[#E8650A] bg-white hover:bg-[#E8650A] hover:text-white transition-all shadow-sm">
        {resource.type === 'link' ? 'Consulter le lien' : 'Télécharger'}
      </button>

      {onNavigateToContact && (
        <button onClick={(e) => { e.stopPropagation(); onNavigateToContact(); }} className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 hover:text-[#E8650A] text-center font-medium"><MessageCircle className="w-3 h-3 inline mr-1" /> Besoin d'aide sur ce sujet ?</button>
      )}
    </div>
  );
}