/* --- Nouveau ResourceForm.tsx avec Upload direct --- */
import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Upload } from 'lucide-react';
import { supabase, Resource, Theme } from '../../lib/supabase';

interface ResourceFormProps {
  themes: Theme[];
  resource: Resource | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResourceForm({ themes, resource, onSuccess, onCancel }: ResourceFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
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

  // FONCTION POUR TÉLÉVERSER LE FICHIER
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Créer un nom de fichier propre (sans espaces bizarres)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Envoyer au Storage Supabase (dans le bucket 'resources')
      const { error: uploadError, data } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      // 4. Mettre à jour le champ URL du formulaire automatiquement
      setFormData(prev => ({ ...prev, url: publicUrl }));

      // Auto-détecter le type selon l'extension
      if (['png', 'jpg', 'jpeg', 'webp'].includes(fileExt?.toLowerCase() || '')) {
        setFormData(prev => ({ ...prev, type: 'image' }));
      } else if (fileExt?.toLowerCase() === 'pdf') {
        setFormData(prev => ({ ...prev, type: 'pdf' }));
      }

    } catch (err: any) {
      setError("Erreur lors du téléversement : " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    const resourceData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      url: formData.url,
      theme_id: formData.theme_id || null,
      is_pinned: formData.is_pinned,
      tags: tagsArray,
      updated_at: new Date().toISOString()
    };

    try {
      if (resource?.id) {
        const { error: updateError } = await supabase.from('resources').update(resourceData).eq('id', resource.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('resources').insert([resourceData]);
        if (insertError) throw insertError;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">{resource ? 'Modifier' : 'Ajouter'} une ressource</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fichier</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={formData.url}
              className="flex-1 px-4 py-2 border rounded-lg bg-slate-50 text-slate-500 text-sm outline-none"
              placeholder="L'URL s'affichera ici après l'upload..."
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.mp4,.mp3"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {formData.url ? 'Changer' : 'Choisir'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white outline-none">
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
              <option value="audio">Audio</option>
              <option value="link">Lien externe</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Thème</label>
          <select value={formData.theme_id} onChange={e => setFormData({ ...formData, theme_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white outline-none">
            <option value="">Sélectionner un thème</option>
            {themes.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg h-20 outline-none" />
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading || uploading} className="flex-1 bg-[#E8650A] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Enregistrer la ressource
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold">Annuler</button>
        </div>
      </form>
    </div>
  );
}