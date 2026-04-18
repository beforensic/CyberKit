import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, AlertCircle, Link, Type, FileText, LayoutGrid, Upload, File, Loader2, ListFilter } from 'lucide-react';

interface ResourceFormProps {
  resource?: any;
  onClose: () => void;
}

// Liste des types officiels CyberKit
const RESOURCE_TYPES = [
  { id: 'guide', label: 'Guide' },
  { id: 'memo', label: 'Mémo' },
  { id: 'infographie', label: 'Infographie' },
  { id: 'podcast', label: 'Podcast' },
  { id: 'image', label: 'Image' },
  { id: 'link', label: 'Lien externe' }
];

export default function ResourceForm({ resource, onClose }: ResourceFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [themes, setThemes] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    url: '',
    theme_id: '',
    type: 'guide' // Type par défaut
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
        type: resource.type || 'guide'
      });
    }
  }, [resource]);

  async function fetchThemes() {
    const { data } = await supabase.from('themes').select('id, title').order('title');
    setThemes(data || []);
  }

  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('resource-files').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('resource-files').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, url: publicUrl }));
    } catch (err: any) {
      setError("Erreur d'upload : " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
          <h2 className="text-2xl font-black text-slate-900">{resource ? 'Modifier la ressource' : 'Nouvelle Ressource'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-left max-h-[75vh] overflow-y-auto">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold"><AlertCircle size={18} /> {error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Titre</label>
              <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: resource ? formData.slug : generateSlug(e.target.value) })} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Thématique</label>
              <select required value={formData.theme_id} onChange={e => setFormData({ ...formData, theme_id: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold">
                <option value="">Choisir un thème</option>
                {themes.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Type de ressource</label>
            <div className="relative">
              <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-slate-700"
              >
                {RESOURCE_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Fichier ou Lien</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input required type="url" placeholder="https://..." value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-medium text-blue-600" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.jpg,.png,.mp3,.mp4" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-6 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2">
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Description</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 resize-none" />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200">Annuler</button>
            <button type="submit" disabled={loading || uploading} className="flex-1 py-4 bg-[#E8650A] text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
              {loading ? 'Enregistrement...' : <Save size={20} />} Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}