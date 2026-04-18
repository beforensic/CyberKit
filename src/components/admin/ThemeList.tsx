import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit2, Plus, Search, LayoutGrid } from 'lucide-react';
import ThemeForm from './ThemeForm';

export default function ThemeList() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  async function fetchThemes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setThemes(data || []);
    } catch (err) {
      console.error('Erreur chargement thèmes:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce thème ? Cela pourrait impacter les ressources et questions liées.')) return;

    try {
      const { error } = await supabase.from('themes').delete().eq('id', id);
      if (error) throw error;
      setThemes(themes.filter(t => t.id !== id));
    } catch (err: any) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  const handleEdit = (theme: any) => {
    setEditingTheme(theme);
    setShowForm(true);
  };

  const filteredThemes = themes.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un thème ou un slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
          />
        </div>
        <button
          onClick={() => { setEditingTheme(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          <Plus size={20} /> Nouveau Thème
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Chargement des thématiques...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => (
            <div key={theme.id} className="group bg-white border border-slate-100 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 transition-all relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                  <LayoutGrid size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(theme)}
                    className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(theme.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">{theme.title}</h3>
              <code className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">
                {theme.slug}
              </code>
              <p className="mt-4 text-slate-500 text-sm leading-relaxed line-clamp-2">
                {theme.description || 'Aucune description fournie.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ThemeForm
          theme={editingTheme}
          onClose={() => { setShowForm(false); fetchThemes(); }}
        />
      )}
    </div>
  );
}