import { useState, useEffect } from 'react';
import { Edit2, Trash2, Check, X, Tag, AlertCircle, Loader, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface KeywordWithUsage {
  keyword: string;
  usageCount: number;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function KeywordManager() {
  const [keywords, setKeywords] = useState<KeywordWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKeyword, setEditingKeyword] = useState<string | null>(null);
  const [newKeywordName, setNewKeywordName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    loadKeywordsWithUsage();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadKeywordsWithUsage = async () => {
    try {
      setLoading(true);

      const [keywordsResponse, resourcesResponse] = await Promise.all([
        supabase.from('keywords').select('keyword').order('keyword'),
        supabase.from('resources').select('tags')
      ]);

      if (keywordsResponse.error) throw keywordsResponse.error;
      if (resourcesResponse.error) throw resourcesResponse.error;

      const allKeywords = keywordsResponse.data || [];
      const allResources = resourcesResponse.data || [];

      const usageMap = new Map<string, number>();
      allResources.forEach((resource) => {
        resource.tags?.forEach((tag: string) => {
          const normalizedTag = tag.toLowerCase().trim();
          usageMap.set(normalizedTag, (usageMap.get(normalizedTag) || 0) + 1);
        });
      });

      const keywordsWithUsage = allKeywords.map((kw) => ({
        keyword: kw.keyword,
        usageCount: usageMap.get(kw.keyword.toLowerCase().trim()) || 0
      }));

      keywordsWithUsage.sort((a, b) => {
        return a.keyword.localeCompare(b.keyword, 'fr', { sensitivity: 'base' });
      });

      setKeywords(keywordsWithUsage);
    } catch (error) {
      console.error('Error loading keywords:', error);
      showToast('Erreur lors du chargement des tags', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleDeleteUnused = async () => {
    const unusedCount = keywords.filter(k => k.usageCount === 0).length;

    if (unusedCount === 0) {
      showToast('Aucun tag inutilisé à supprimer', 'error');
      return;
    }

    if (!confirm(`Voulez-vous vraiment supprimer ${unusedCount} tag(s) inutilisé(s) ?`)) {
      return;
    }

    try {
      setProcessing(true);
      const unusedKeywords = keywords.filter(k => k.usageCount === 0).map(k => k.keyword);

      const { error } = await supabase
        .from('keywords')
        .delete()
        .in('keyword', unusedKeywords);

      if (error) throw error;

      await loadKeywordsWithUsage();

      showToast(`${unusedCount} tag(s) inutilisé(s) supprimé(s) avec succès`, 'success');
    } catch (error) {
      console.error('Error deleting unused keywords:', error);
      showToast('Erreur lors de la suppression des tags', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleStartEdit = (keyword: string) => {
    setEditingKeyword(keyword);
    setNewKeywordName(keyword);
  };

  const handleCancelEdit = () => {
    setEditingKeyword(null);
    setNewKeywordName('');
  };

  const handleRenameKeyword = async (oldKeyword: string) => {
    const trimmedNewName = newKeywordName.trim().toLowerCase();

    if (!trimmedNewName) {
      showToast('Le nom du tag ne peut pas être vide', 'error');
      return;
    }

    if (trimmedNewName === oldKeyword.toLowerCase().trim()) {
      handleCancelEdit();
      return;
    }

    const keywordInfo = keywords.find(k => k.keyword === oldKeyword);
    const usageCount = keywordInfo?.usageCount || 0;

    if (usageCount > 10) {
      if (!confirm(`Ce tag est utilisé par ${usageCount} ressources. Voulez-vous vraiment le renommer ?`)) {
        return;
      }
    }

    try {
      setProcessing(true);

      const { data: resources, error: fetchError } = await supabase
        .from('resources')
        .select('id, tags');

      if (fetchError) throw fetchError;

      const resourcesToUpdate = (resources || []).filter((resource) =>
        resource.tags?.some((tag: string) => tag.toLowerCase().trim() === oldKeyword.toLowerCase().trim())
      );

      for (const resource of resourcesToUpdate) {
        const updatedTags = resource.tags.map((tag: string) =>
          tag.toLowerCase().trim() === oldKeyword.toLowerCase().trim() ? trimmedNewName : tag
        );

        const { error: updateError } = await supabase
          .from('resources')
          .update({ tags: updatedTags })
          .eq('id', resource.id);

        if (updateError) throw updateError;
      }

      const { error: keywordError } = await supabase
        .from('keywords')
        .update({ keyword: trimmedNewName })
        .eq('keyword', oldKeyword);

      if (keywordError) throw keywordError;

      setKeywords(prev => prev.map(k =>
        k.keyword === oldKeyword
          ? { ...k, keyword: trimmedNewName }
          : k
      ));

      showToast(
        `Tag renommé avec succès (${resourcesToUpdate.length} ressource(s) mise(s) à jour)`,
        'success'
      );

      handleCancelEdit();
    } catch (error) {
      console.error('Error renaming keyword:', error);
      showToast('Erreur lors du renommage du tag', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteKeyword = async (keyword: string) => {
    const keywordInfo = keywords.find(k => k.keyword === keyword);
    const usageCount = keywordInfo?.usageCount || 0;

    if (usageCount > 0) {
      if (!confirm(`Ce tag est utilisé par ${usageCount} ressource(s). Le supprimer le retirera de toutes ces ressources. Continuer ?`)) {
        return;
      }
    }

    try {
      setProcessing(true);

      if (usageCount > 0) {
        const { data: resources, error: fetchError } = await supabase
          .from('resources')
          .select('id, tags');

        if (fetchError) throw fetchError;

        const resourcesToUpdate = (resources || []).filter((resource) =>
          resource.tags?.some((tag: string) => tag.toLowerCase().trim() === keyword.toLowerCase().trim())
        );

        for (const resource of resourcesToUpdate) {
          const updatedTags = resource.tags.filter(
            (tag: string) => tag.toLowerCase().trim() !== keyword.toLowerCase().trim()
          );

          const { error: updateError } = await supabase
            .from('resources')
            .update({ tags: updatedTags })
            .eq('id', resource.id);

          if (updateError) throw updateError;
        }
      }

      const { error } = await supabase
        .from('keywords')
        .delete()
        .eq('keyword', keyword);

      if (error) throw error;

      setKeywords(prev => prev.filter(k => k.keyword !== keyword));

      showToast(
        usageCount > 0
          ? `Tag supprimé (retiré de ${usageCount} ressource(s))`
          : 'Tag supprimé avec succès',
        'success'
      );
    } catch (error) {
      console.error('Error deleting keyword:', error);
      showToast('Erreur lors de la suppression du tag', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateTag = async () => {
    const trimmedTag = newTagInput.trim().toLowerCase();

    if (!trimmedTag) {
      showToast('Le nom du tag ne peut pas être vide', 'error');
      return;
    }

    const exists = keywords.some(k => k.keyword.toLowerCase() === trimmedTag);
    if (exists) {
      showToast('Ce tag existe déjà', 'error');
      return;
    }

    try {
      setProcessing(true);

      const { error } = await supabase
        .from('keywords')
        .insert({ keyword: trimmedTag });

      if (error) {
        if (error.code === '23505') {
          showToast('Ce tag existe déjà dans la base de données', 'error');
          await loadKeywordsWithUsage();
          setNewTagInput('');
          return;
        }
        throw error;
      }

      await loadKeywordsWithUsage();
      setNewTagInput('');
      showToast('Tag créé avec succès', 'success');
    } catch (error: any) {
      console.error('Error creating tag:', error);
      const errorMessage = error?.message || 'Erreur inconnue';
      showToast(`Erreur lors de la création du tag: ${errorMessage}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const unusedCount = keywords.filter(k => k.usageCount === 0).length;

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-6 h-6 text-blue-600" />
              Gestion des Tags
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {keywords.length} tag(s) au total
              {unusedCount > 0 && (
                <span className="text-orange-600 font-semibold ml-2">
                  • {unusedCount} inutilisé(s)
                </span>
              )}
            </p>
          </div>
          {unusedCount > 0 && (
            <button
              onClick={handleDeleteUnused}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer les tags inutilisés
            </button>
          )}
        </div>

        <div className="mb-6 flex items-center gap-3">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTag();
            }}
            placeholder="Nouveau tag..."
            disabled={processing}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleCreateTag}
            disabled={processing || !newTagInput.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Ajouter un tag
          </button>
        </div>

        <div className="space-y-2">
          {keywords.map((keyword) => (
            <div
              key={keyword.keyword}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                keyword.usageCount === 0
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {editingKeyword === keyword.keyword ? (
                  <input
                    type="text"
                    value={newKeywordName}
                    onChange={(e) => setNewKeywordName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameKeyword(keyword.keyword);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                    autoFocus
                    disabled={processing}
                  />
                ) : (
                  <>
                    <span className="font-medium text-gray-900">
                      {keyword.keyword}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          keyword.usageCount === 0
                            ? 'bg-orange-200 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {keyword.usageCount === 0
                          ? 'Inutilisé'
                          : `${keyword.usageCount} ressource${keyword.usageCount > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingKeyword === keyword.keyword ? (
                  <>
                    <button
                      onClick={() => handleRenameKeyword(keyword.keyword)}
                      disabled={processing}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Valider"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={processing}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Annuler"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEdit(keyword.keyword)}
                      disabled={processing}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Modifier"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteKeyword(keyword.keyword)}
                      disabled={processing}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {keywords.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucun tag disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
