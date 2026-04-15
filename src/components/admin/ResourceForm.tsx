import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader, Upload, CheckCircle2 } from 'lucide-react';
import { supabase, Resource, Theme, ResourceType } from '../../lib/supabase';

interface ResourceFormProps {
  themes: Theme[];
  resourceTypes: ResourceType[];
  resource: Resource | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResourceForm({ themes, resourceTypes, resource, onSuccess, onCancel }: ResourceFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf' as 'pdf' | 'audio' | 'video' | 'link' | 'image',
    resource_type_id: '',
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
        resource_type_id: resource.resource_type_id || '',
        url: resource.url || '',
        theme_id: resource.theme_id || '',
        is_pinned: resource.is_pinned || false,
        tags: resource.tags ? resource.tags.join(', ') : ''
      });
    } else if (resourceTypes.length > 0) {
      setFormData(prev => ({ ...prev, resource_type_id: resourceTypes[0].id }));
    }
  }, [resource, resourceTypes]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, url: publicUrl }));

      // Détection automatique du type
      const lowerExt = fileExt?.toLowerCase();
      if (['png', 'jpg', 'jpeg', 'webp'].includes(lowerExt || '')) setFormData(p => ({ ...p, type: 'image' }));
      else if (lowerExt === 'pdf') setFormData(p => ({ ...p, type: 'pdf' }));
      else if (['mp3', 'wav', 'ogg'].includes(lowerExt || '')) setFormData(p => ({ ...p, type: 'audio' }));
      else if (['mp4', 'mov', 'webm'].includes(lowerExt || '')) setFormData(p => ({ ...p, type: 'video' }));

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
      resource_type_id: formData.resource_type_id,
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
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900">{resource ? 'Modifier la ressource' : 'Nouvelle ressource'}</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
          <label className="block text-sm font-bold text-slate-700 mb-2">Fichier de la ressource</label>
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input type="text" readOnly value={formData.url} className="w-full px-4 py-3 border rounded-lg bg-white text-xs text-slate-500 truncate" placeholder="L'URL sera générée après l'upload..." />
              {formData.url && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3.5" />}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {formData.url ? 'Remplacer' : 'Téléverser'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Titre</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#E8650A] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Thème</label>
            <select value={formData.theme_id} onChange={e => setFormData({ ...formData, theme_id: e.target.value })} className="w-full px-4 py-3 border rounded-lg bg-white outline-none">
              <option value="">-- Aucun thème --</option>
              {themes.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Format (Technique)</label>
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-4 py-3 border rounded-lg bg-white outline-none">
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
              <option value="audio">Audio</option>
              <option value="link">Lien externe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Type (Pédagogique)</label>
            <select required value={formData.resource_type_id} onChange={e => setFormData({ ...formData, resource_type_id: e.target.value })} className="w-full px-4 py-3 border rounded-lg bg-white outline-none border-orange-100">
              <option value="">-- Sélectionner un type --</option>
              {resourceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
          <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border rounded-lg h-24 outline-none resize-none" placeholder="Décrivez la ressource..." />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Tags (séparés par des virgules)</label>
          <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-3 border rounded-lg outline-none" placeholder="rgpd, mdp, phishing..." />
        </div>

        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100 w-fit">
          <input type="checkbox" id="is_pinned" checked={formData.is_pinned} onChange={e => setFormData({ ...formData, is_pinned: e.target.checked })} className="w-5 h-5 accent-[#E8650A]" />
          <label htmlFor="is_pinned" className="text-sm font-bold text-slate-700 cursor-pointer">Mettre en avant (Badge "Essentiel")</label>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

        <div className="flex gap-4 pt-6">
          <button type="submit" disabled={loading || uploading} className="flex-1 bg-[#E8650A] text-white py-4 rounded-xl font-bold hover:bg-[#d15809] shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {resource ? 'Enregistrer les modifications' : 'Créer la ressource'}
          </button>
          <button type="button" onClick={onCancel} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Annuler</button>
        </div>
      </form>
    </div>
  );
}