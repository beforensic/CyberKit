import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, AlertCircle, Link, Type, FileText, LayoutGrid } from 'lucide-react';

interface ResourceFormProps {
  resource?: any;
  onClose: () => void;
}

export default function ResourceForm({ resource, onClose }: ResourceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [themes, setThemes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    url: '',
    theme_id: '',
    type: 'article' // par défaut
  });

  useEffect(() => {
    fetchThemes();
    if (resource) {
      setFormData({
        title: resource.title || '',
        slug: resource.slug || '',
        description: resource.description || '',
        url: resource.url || '',
        theme_id: resource.theme_id || '',
        type: resource.type || 'article'
      });
    }
  }, [resource]);

  async function fetchThemes() {
    const { data } = await supabase.from('themes').select('id, title').order('title');
    setThemes(data || []);
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: resource ? prev.slug : generateSlug(title)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (resource) {
        const { error } = await supabase.from('resources').update(formData).eq('id', resource.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('resources').insert([formData]);
        if (error) throw error;
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-black text-slate-900">
            {resource ? 'Modifier la ressource' : 'Nouvelle Ressource'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-left max-h-[70vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Titre</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input required type="text" value={formData.title} onChange={handleTitleChange} className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Thématique</label>
              <div className="relative">
                <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <select
                  required
                  value={formData.theme_id}
                  onChange={e => setFormData({ ...formData, theme_id: e.target.value })}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-slate-700"
                >
                  <option value="">Sélectionner un thème</option>
                  {themes.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Lien (URL)</label>
            <div className="relative">
              <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input required type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-blue-600" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Description</label>
            <div className="relative">
              <FileText className="absolute left-4 top-6 text-slate-300 w-4 h-4" />
              <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 resize-none" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-[#E8650A] text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
              {loading ? 'Enregistrement...' : <><Save size={20} /> Enregistrer la ressource</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}