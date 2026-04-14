import { Edit, Trash2 } from 'lucide-react';
import { Theme } from '../../lib/supabase';
import { getIconComponent } from '../../utils/icons';

interface ThemeListProps {
  themes: Theme[];
  onEdit: (theme: Theme) => void;
  onDelete: (id: string) => void;
}

export default function ThemeList({ themes, onEdit, onDelete }: ThemeListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Thèmes</h2>
        <p className="text-sm text-gray-600 mt-1">
          {themes.length} thème{themes.length > 1 ? 's' : ''} disponible{themes.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {themes.map((theme) => {
          const IconComponent = getIconComponent(theme.icon_name);
          return (
            <div
              key={theme.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{theme.title}</h3>
                  {theme.description && (
                    <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Slug: {theme.slug} | Icône: {theme.icon_name || 'Aucune'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(theme)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(theme.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {themes.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Aucun thème disponible
        </div>
      )}
    </div>
  );
}
