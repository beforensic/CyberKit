import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Theme } from '../../lib/supabase';
import { getIconComponent } from '../../utils/icons';

interface ThemeFormProps {
  theme: Theme | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const AVAILABLE_ICONS = [
  'Gavel', 'EyeOff', 'Info', 'Landmark', 'Brain',
  'ShieldAlert', 'Key', 'Share2', 'HardDrive', 'Network',
  'Globe', 'Shield', 'Lock', 'FileText', 'Settings',
  'Database', 'Cloud', 'AlertTriangle', 'CheckCircle', 'Users'
];

export default function ThemeForm({ theme, onSuccess, onCancel }: ThemeFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    icon_name: 'Info'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (theme) {
      setFormData({
        title: theme.title,
        description: theme.description,
        slug: theme.slug,
        icon_name: theme.icon_name || 'Info'
      });
    }
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (theme) {
        const { error } = await supabase
          .from('themes')
          .update(formData)
          .eq('id', theme.id);

        if (error) throw error;
        alert('Thème modifié avec succès');
      } else {
        const { error } = await supabase
          .from('themes')
          .insert([formData]);

        if (error) throw error;
        alert('Thème créé avec succès');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {theme ? 'Modifier le thème' : 'Nouveau thème'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icône
          </label>
          <div className="grid grid-cols-5 gap-2">
            {AVAILABLE_ICONS.map((iconName) => {
              const IconComponent = getIconComponent(iconName);
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon_name: iconName })}
                  className={`p-3 border-2 rounded-lg flex items-center justify-center transition-all ${
                    formData.icon_name === iconName
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5 text-gray-700" />
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Icône sélectionnée: {formData.icon_name}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Enregistrement...' : theme ? 'Mettre à jour' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
