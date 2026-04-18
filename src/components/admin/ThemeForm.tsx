import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, AlertCircle } from 'lucide-react';

interface ThemeFormProps {
  theme?: any;
  onClose: () => void;
}

export default function ThemeForm({ theme, onClose }: ThemeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    if (theme) {
      setFormData({
        title: theme.title || '',
        slug: theme.slug || '',
        description: theme.description || ''
      });
    }
  }, [theme]);

  // Génération automatique du slug (ex: "Sécurité Info" -> "securite-info")
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlever accents
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: theme ? prev.slug : generateSlug(title) // On ne change le slug que si c'est une création
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (theme) {
        // Mise à jour
        const { error } = await supabase
          .from('themes')
          .update(formData)
          .eq('id', theme.id);
        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('themes')
          .insert([formData]);
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-black text-slate-900">
            {theme ? 'Modifier le thème' : 'Nouveau Thème'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-medium text-sm">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Titre du Thème</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all font-bold text-slate-700"
              placeholder="Ex: Protection des données"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Slug (URL)</label>
            <input
              required
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all font-mono text-xs text-orange-600"
              placeholder="protection-donnees"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all resize-none text-slate-600"
              placeholder="Décrivez l'objectif de cette thématique..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-[#E8650A] text-white rounded-2xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Enregistrement...' : <><Save size={20} /> Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}