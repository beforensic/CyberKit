import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit2, Search } from 'lucide-react';
import { useThemes } from '../../hooks/useThemes';
import { useResources } from '../../hooks/useResources';

interface ResourceListProps {
  onEdit: (resource: any) => void;
}

const TYPE_LABELS: Record<string, string> = {
  guide: 'Guide',
  memo: 'Mémo',
  infographie: 'Infographie',
  podcast: 'Podcast',
  image: 'Image',
  link: 'Lien externe'
};

export default function ResourceList({ onEdit }: ResourceListProps) {
  const { themes } = useThemes();
  const { resources, loading, refetch } = useResources();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette ressource ?')) return;
    try {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
      await refetch();
    } catch (err: any) {
      alert("Erreur de suppression : " + err.message);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = selectedTheme === 'all' || r.theme_id === selectedTheme;
    return matchesSearch && matchesTheme;
  });

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une ressource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20 font-medium"
          />
        </div>
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="bg-slate-50 border-none px-6 py-4 rounded-2xl text-sm font-bold text-slate-600 focus:ring-0 cursor-pointer"
        >
          <option value="all">Toutes les thématiques</option>
          {themes.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium italic">
          Chargement de la bibliothèque...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ressource</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredResources.map((res) => (
                <tr key={res.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 leading-tight mb-1">{res.title}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {res.theme?.title || 'Sans thématique'}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="px-3 py-1 bg-brand-orange-50 text-brand-orange rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-orange-100">
                      {TYPE_LABELS[res.type] || res.type || 'Guide'}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(res)}
                        className="p-2 text-slate-400 hover:text-brand-orange-600 hover:bg-brand-orange-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResources.length === 0 && (
            <div className="py-20 text-center text-slate-400">Aucune ressource trouvée.</div>
          )}
        </div>
      )}
    </div>
  );
}
