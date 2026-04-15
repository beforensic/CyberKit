/* --- ResourceForm.tsx avec Type Pédagogique --- */
import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Upload } from 'lucide-react';
import { supabase, Resource, Theme, ResourceType } from '../../lib/supabase';

interface ResourceFormProps {
  themes: Theme[];
  resourceTypes: ResourceType[]; // AJOUTÉ
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
    type: 'pdf',
    resource_type_id: '', // AJOUTÉ
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
      // Par défaut, on prend le premier type (souvent "Guide")
      setFormData(prev => ({ ...prev, resource_type_id: resourceTypes[0].id }));
    }
  }, [resource, resourceTypes]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error: upErr } = await supabase.storage.from('resources').upload(fileName, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, url: publicUrl }));
    } catch (err: any) { setError(err.message); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    const resourceData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      resource_type_id: formData.resource_type_id, // ENFIN ENVOYÉ !
      url: formData.url,
      theme_id: formData.theme_id || null,
      is_pinned: formData.is_pinned,
      tags: tagsArray,
      updated_at: new Date().toISOString()
    };

    try {
      const { error: saveErr } = resource?.id
        ? await supabase.from('resources').update(resourceData).eq('id', resource.id)
        : await supabase.from('resources').insert([resourceData]);
      if (saveErr) throw saveErr;
      onSuccess();
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <h2 className="text-xl font-bold mb-6">{resource ? 'Modifier' : 'Ajouter'} une ressource</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Upload */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Fichier</label>
            <input type="text" readOnly value={formData.url} className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-xs" />
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" /> {formData.url ? 'Changer' : 'Choisir'}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Titre</label>
          <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Format (Technique)</label>
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white">
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
              <option value="audio">Audio</option>
              <option value="link">Lien externe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type Pédagogique (Badge)</label>
            <select required value={formData.resource_type_id} onChange={e => setFormData({ ...formData, resource_type_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white">
              {resourceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Thème</label>
          <select value={formData.theme_id} onChange={e => setFormData({ ...formData, theme_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white">
            <option value="">Sélectionner un thème</option>
            {themes.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>

        {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading || uploading} className="flex-1 bg-[#E8650A] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 py-3 rounded-lg font-bold">Annuler</button>
        </div>
      </form>
    </div>
  );
}