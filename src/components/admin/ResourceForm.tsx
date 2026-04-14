import { useState, useEffect } from 'react';
import { X, Upload, Loader, Lightbulb, Plus } from 'lucide-react';
import { supabase, Resource, Theme, ResourceType } from '../../lib/supabase';

interface ResourceFormProps {
  themes: Theme[];
  resource: Resource | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResourceForm({ themes, resource, onSuccess, onCancel }: ResourceFormProps) {
  const [formData, setFormData] = useState({
    theme_id: '',
    title: '',
    description: '',
    resource_type_id: '' as string,
    file_format: '' as 'pdf' | 'image' | 'video' | 'audio' | 'external_link' | '',
    url: '',
    tags: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allKeywords, setAllKeywords] = useState<string[]>([]);
  const [themeSuggestions, setThemeSuggestions] = useState<string[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);

  useEffect(() => {
    loadKeywords();
    loadResourceTypes();
  }, []);

  useEffect(() => {
    if (resource) {
      console.log('=== INITIALISATION DU FORMULAIRE ===');
      console.log('Ressource à éditer:', resource);
      const initialData = {
        theme_id: resource.theme_id,
        title: resource.title,
        description: resource.description || '',
        resource_type_id: resource.resource_type_id,
        file_format: resource.file_format || '',
        url: resource.url,
        tags: resource.tags?.join(', ') || ''
      };
      console.log('Données initiales du formulaire:', initialData);
      setFormData(initialData);
    }
  }, [resource]);

  useEffect(() => {
    if (formData.title.length > 3 || formData.description.length > 3) {
      generateKeywordSuggestions();
    } else {
      setContentSuggestions([]);
    }
  }, [formData.title, formData.description, allKeywords, formData.tags]);

  useEffect(() => {
    if (formData.theme_id) {
      loadThemeTopTags(formData.theme_id);
    } else {
      setThemeSuggestions([]);
    }
  }, [formData.theme_id, formData.tags]);

  const loadKeywords = async () => {
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select('keyword')
        .order('keyword');

      if (error) throw error;
      setAllKeywords(data?.map(k => k.keyword) || []);
    } catch (error) {
      console.error('Error loading keywords:', error);
    }
  };

  const loadResourceTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('resource_types')
        .select('*')
        .order('order');

      if (error) throw error;
      console.log('Types de ressources chargés:', data);
      setResourceTypes(data || []);
    } catch (error) {
      console.error('Error loading resource types:', error);
    }
  };

  const loadThemeTopTags = async (themeId: string) => {
    try {
      const { data: resources, error } = await supabase
        .from('resources')
        .select('tags')
        .eq('theme_id', themeId);

      if (error) throw error;

      const tagFrequency = new Map<string, number>();
      resources?.forEach((resource) => {
        resource.tags?.forEach((tag: string) => {
          const normalizedTag = normalizeTag(tag);
          tagFrequency.set(normalizedTag, (tagFrequency.get(normalizedTag) || 0) + 1);
        });
      });

      const currentTags = formData.tags
        .split(',')
        .map(t => normalizeTag(t))
        .filter(t => t);

      const topTags = Array.from(tagFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .filter(([tag]) => !currentTags.includes(tag))
        .slice(0, 5)
        .map(([tag]) => tag);

      setThemeSuggestions(topTags);
    } catch (error) {
      console.error('Error loading theme top tags:', error);
    }
  };

  const normalizeTag = (tag: string): string => {
    return tag.trim().toLowerCase().replace(/\s+/g, ' ');
  };

  const generateKeywordSuggestions = () => {
    const titleLower = formData.title.toLowerCase();
    const descriptionLower = formData.description.toLowerCase();
    const combinedText = `${titleLower} ${descriptionLower}`;

    const textWords = combinedText
      .split(/[\s,;.!?()]+/)
      .filter(word => word.length > 2);

    const currentTags = formData.tags
      .split(',')
      .map(t => normalizeTag(t))
      .filter(t => t);

    const suggestions = allKeywords
      .filter(keyword => {
        const keywordLower = keyword.toLowerCase();
        const keywordWords = keywordLower.split(/[\s-]+/);

        if (currentTags.includes(keywordLower)) {
          return false;
        }

        if (themeSuggestions.includes(keywordLower)) {
          return false;
        }

        if (combinedText.includes(keywordLower)) {
          return true;
        }

        return keywordWords.some(kw =>
          textWords.some(tw => tw.includes(kw) || kw.includes(tw))
        );
      })
      .slice(0, 8);

    setContentSuggestions(suggestions);
  };

  const addKeyword = (keyword: string) => {
    const normalizedKeyword = normalizeTag(keyword);
    const currentTags = formData.tags
      .split(',')
      .map(t => normalizeTag(t))
      .filter(t => t);

    if (!currentTags.includes(normalizedKeyword)) {
      const newTags = formData.tags
        ? formData.tags + ', ' + normalizedKeyword
        : normalizedKeyword;
      setFormData({ ...formData, tags: newTags });
    }
  };

  const handleCreateNewTag = async () => {
    const trimmedTag = newTagInput.trim().toLowerCase();

    if (!trimmedTag) {
      alert('Le nom du tag ne peut pas être vide');
      return;
    }

    const exists = allKeywords.some(k => k.toLowerCase() === trimmedTag);
    if (exists) {
      addKeyword(trimmedTag);
      setNewTagInput('');
      return;
    }

    try {
      setCreatingTag(true);

      const { error } = await supabase
        .from('keywords')
        .insert({ keyword: trimmedTag });

      if (error) {
        if (error.code === '23505') {
          setAllKeywords([...allKeywords, trimmedTag]);
          addKeyword(trimmedTag);
          setNewTagInput('');
          alert('Tag ajouté avec succès (il existait déjà dans la base)');
          return;
        }
        throw error;
      }

      setAllKeywords([...allKeywords, trimmedTag]);
      addKeyword(trimmedTag);
      setNewTagInput('');
      alert('Tag créé et ajouté avec succès');
    } catch (error: any) {
      console.error('Error creating tag:', error);
      const errorMessage = error?.message || 'Erreur inconnue';
      alert(`Erreur lors de la création du tag: ${errorMessage}`);
    } finally {
      setCreatingTag(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== DÉBUT DE LA SOUMISSION ===');
    console.log('Mode:', resource ? 'Édition' : 'Création');
    console.log('Valeurs du formulaire:', formData);
    console.log('Ressource originale:', resource);

    try {
      setSaving(true);

      let finalUrl = formData.url;

      if (file && formData.file_format !== 'external_link') {
        setUploading(true);
        try {
          finalUrl = await uploadFile(file);
          setUploading(false);
        } catch (uploadError: any) {
          setUploading(false);
          console.error('Upload error:', uploadError);
          alert(`Erreur lors de l'upload du fichier: ${uploadError.message || 'Erreur inconnue'}`);
          return;
        }
      }

      const tagsArray = formData.tags
        .split(',')
        .map((tag) => normalizeTag(tag))
        .filter((tag) => tag.length > 0);

      for (const tag of tagsArray) {
        if (!allKeywords.some(k => k.toLowerCase() === tag)) {
          try {
            await supabase
              .from('keywords')
              .insert([{ keyword: tag }]);
            console.log(`New keyword saved: ${tag}`);
          } catch (error) {
            console.log(`Keyword ${tag} may already exist or error occurred:`, error);
          }
        }
      }

      // Récupérer le type technique à partir du resource_type_id
      const selectedResourceType = resourceTypes.find(rt => rt.id === formData.resource_type_id);
      if (!selectedResourceType) {
        throw new Error('Type pédagogique invalide');
      }

      const resourceData = {
        theme_id: formData.theme_id,
        title: formData.title,
        description: formData.description,
        type: selectedResourceType.technical_type,
        resource_type_id: formData.resource_type_id,
        file_format: formData.file_format || null,
        url: finalUrl,
        tags: tagsArray
      };

      console.log('Données à enregistrer:', resourceData);

      if (resource) {
        const { data, error } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', resource.id)
          .select();

        if (error) {
          console.error('Erreur de mise à jour:', error);
          console.error('Code d\'erreur:', error.code);
          console.error('Détails:', error.details);
          throw new Error(`Erreur lors de la mise à jour: ${error.message || 'Erreur inconnue'}. Code: ${error.code || 'N/A'}`);
        }
        console.log('Ressource mise à jour avec succès:', data);
      } else {
        const { data, error } = await supabase
          .from('resources')
          .insert([resourceData])
          .select();

        if (error) {
          console.error('Erreur d\'insertion:', error);
          console.error('Code d\'erreur:', error.code);
          console.error('Détails:', error.details);
          throw new Error(`Erreur lors de l'ajout: ${error.message || 'Erreur inconnue'}. Code: ${error.code || 'N/A'}`);
        }
        console.log('Ressource ajoutée avec succès:', data);
      }

      alert(resource ? 'Ressource mise à jour avec succès' : 'Ressource ajoutée avec succès');
      onSuccess();
    } catch (error: any) {
      console.error('Error saving resource:', error);
      alert(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const isFormValid = () => {
    if (!formData.theme_id || !formData.title || !formData.resource_type_id || !formData.file_format) {
      return false;
    }

    if (formData.file_format === 'external_link' && !formData.url) {
      return false;
    }

    if (formData.file_format !== 'external_link' && !resource && !file) {
      return false;
    }

    return true;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {resource ? 'Modifier la ressource' : 'Nouvelle ressource'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="theme_id" className="block text-sm font-medium text-gray-700 mb-2">
              Thème *
            </label>
            <select
              id="theme_id"
              value={formData.theme_id}
              onChange={(e) => setFormData({ ...formData, theme_id: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              required
            >
              <option value="">Sélectionner un thème</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type pédagogique *
            </label>
            <select
              id="type"
              value={formData.resource_type_id}
              onChange={(e) => {
                console.log('Changement de type pédagogique:', e.target.value);
                setFormData({ ...formData, resource_type_id: e.target.value });
              }}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              required
            >
              <option value="">Sélectionner un type</option>
              {resourceTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="file_format" className="block text-sm font-medium text-gray-700 mb-2">
            Format de fichier *
          </label>
          <select
            id="file_format"
            value={formData.file_format}
            onChange={(e) => {
              console.log('Changement de format de fichier:', e.target.value);
              setFormData({ ...formData, file_format: e.target.value as any });
            }}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            required
          >
            <option value="">Sélectionner un format</option>
            <option value="pdf">PDF</option>
            <option value="image">Image (PNG)</option>
            <option value="video">Vidéo</option>
            <option value="audio">Audio</option>
            <option value="external_link">Lien externe</option>
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Titre de la ressource"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Description de la ressource"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Mots-clés (séparés par des virgules)
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="tag1, tag2, tag3"
          />
          <p className="text-xs text-gray-500 mt-1">
            Les tags sont automatiquement normalisés en minuscules
          </p>
          <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateNewTag();
                }
              }}
              placeholder="Créer un nouveau tag..."
              disabled={creatingTag}
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleCreateNewTag}
              disabled={creatingTag || !newTagInput.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Créer ce tag
            </button>
          </div>
          {(themeSuggestions.length > 0 || contentSuggestions.length > 0) && (
            <div className="mt-4 space-y-3">
              {themeSuggestions.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-gray-700 font-semibold">
                      Tags populaires pour ce thème :
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {themeSuggestions.map((keyword, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addKeyword(keyword)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 hover:shadow-md transition-all border border-blue-300"
                      >
                        <Plus className="w-3 h-3" />
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {contentSuggestions.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm text-gray-700 font-semibold">
                      Suggestions intelligentes basées sur le contenu :
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contentSuggestions.map((keyword, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addKeyword(keyword)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 hover:shadow-md transition-all border border-emerald-300"
                      >
                        <Plus className="w-3 h-3" />
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {formData.file_format === 'external_link' ? (
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              URL *
            </label>
            <input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="https://example.com"
              required
            />
          </div>
        ) : formData.file_format ? (
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              Fichier {!resource && '*'}
            </label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="file"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <Upload className="w-5 h-5" />
                {file ? file.name : 'Choisir un fichier'}
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="hidden"
                accept={
                  formData.file_format === 'pdf'
                    ? '.pdf'
                    : formData.file_format === 'image'
                    ? 'image/png'
                    : formData.file_format === 'audio'
                    ? 'audio/*'
                    : 'video/*'
                }
              />
            </div>
            {formData.file_format === 'audio' && (
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés : .mp3, .wav, .ogg, .m4a, .webm
              </p>
            )}
            {formData.file_format === 'video' && (
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés : .mp4, .webm
              </p>
            )}
            {resource && (
              <p className="text-xs text-gray-500 mt-2">
                Laissez vide pour garder le fichier actuel
              </p>
            )}
          </div>
        ) : null}

        <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-100">
          <button
            type="submit"
            disabled={!isFormValid() || saving || uploading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {(saving || uploading) && <Loader className="w-5 h-5 animate-spin" />}
            {uploading ? 'Upload en cours...' : saving ? 'Enregistrement...' : resource ? 'Mettre à jour' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving || uploading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
