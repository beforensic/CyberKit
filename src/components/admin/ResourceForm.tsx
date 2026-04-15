import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase, Resource, Theme } from '../../lib/supabase';

interface ResourceFormProps {
  themes: Theme[];
  resource: Resource | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResourceForm({ themes, resource, onSuccess, onCancel }: ResourceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf', // On utilise 'type' au lieu de 'file_format'
    url: '',
    theme_id: '',
    is_pinned: false,
    tags: ''
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || '',
        description: resource.description || '',
        type: resource.type || 'pdf',
        url: resource.url || '',
        theme_id: resource.theme_id || '',
        is_pinned: resource.is_pinned || false,
        tags: resource.tags ? resource.tags.join(', ') : ''
      });
    }
  }, [resource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const resourceData = {
      title: formData.title,
      description: formData.description,
      type: formData.type, // La colonne correcte dans Supabase
      url: formData.url,
      theme_id: formData.theme_id || null,
      is_pinned: formData.is_pinned,
      tags: tagsArray,
      updated_at: new Date().toISOString()
    };

    try {
      if (resource?.id) {
        // Mode ÉDITION
        const { error: updateError } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', resource.id);
        if (updateError) throw updateError;
      } else {
        // Mode AJOUT
        const { error: insertError } = await supabase
          .from('resources')
          .insert([resourceData]);
        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          {resource ? 'Modifier la ressource' : 'Ajouter une ressource'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E8650A] outline-none"
            placeholder="Ex: Mémo RGPD"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Format (Type)</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E8650A] outline-none bg-white"
            >
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
              <option value="audio">Audio</option>
              <option value="link">Lien externe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Thème</label>
            <select
              value={formData.theme_id}
              onChange={e => setFormData({ ...formData, theme_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E8650A] outline-none bg-white"
            >
              <option value="">Sélectionner un thème</option>
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>{theme.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">URL du fichier / lien</label>
          <input
            type="url"
            required
            value={formData.url}
            onChange={e => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E8650A] outline-none"
            placeholder="https://supabase.co/storage/v1/object/public/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E8650A] outline-none h-24"
            placeholder="Décrivez brièvement la ressource..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tags (séparés par des virgules)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E8650A] outline-none"
            placeholder="sécurité, rgpd, mobile..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_pinned"
            checked={formData.is_pinned}
            onChange={e => setFormData({ ...formData, is_pinned: e.target.checked })}
            className="w-4 h-4 text-[#E8650A] border-slate-300 rounded focus:ring-[#E8650A]"
          />
          <label htmlFor="is_pinned" className="text-sm font-medium text-slate-700">
            Mettre en avant (Badge "Essentiel")
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#E8650A] text-white py-3 rounded-lg font-semibold hover:bg-[#d15809] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Enregistrer
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-all"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}