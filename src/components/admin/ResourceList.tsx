import { Edit2, Trash2, FileText, PlayCircle, Headphones, ExternalLink, Image } from 'lucide-react';
import { Resource } from '../../lib/supabase';

interface ResourceListProps {
  resources: Resource[];
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
}

export default function ResourceList({ resources, onEdit, onDelete }: ResourceListProps) {
  const getFileFormatIcon = (format: string | null | undefined) => {
    switch (format) {
      case 'pdf':
        return FileText;
      case 'video':
        return PlayCircle;
      case 'audio':
        return Headphones;
      case 'external_link':
        return ExternalLink;
      case 'image':
        return Image;
      default:
        return FileText;
    }
  };

  const getFileFormatBadge = (format: string | null | undefined) => {
    const styles = {
      pdf: 'bg-black text-white',
      video: 'bg-sky-500 text-white',
      audio: 'bg-gray-500 text-white',
      external_link: 'bg-emerald-500 text-white',
      image: 'bg-purple-500 text-white'
    };
    return styles[format as keyof typeof styles] || 'bg-gray-500 text-white';
  };

  const getFileFormatLabel = (format: string | null | undefined) => {
    const labels: Record<string, string> = {
      pdf: 'PDF',
      video: 'Vidéo',
      audio: 'Audio',
      external_link: 'Lien',
      image: 'Image'
    };
    return labels[format || ''] || 'N/A';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Format
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Titre
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type péda.
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Thème
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {resources.map((resource) => {
              const Icon = getFileFormatIcon(resource.file_format);
              return (
                <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`${getFileFormatBadge(resource.file_format)} p-2 rounded-lg`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {getFileFormatLabel(resource.file_format)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {resource.title}
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs truncate">
                      {resource.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      {resource.resource_type?.name || resource.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {resource.theme?.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {resource.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          {tag}
                        </span>
                      ))}
                      {resource.tags && resource.tags.length > 2 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          +{resource.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(resource)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Éditer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(resource.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {resources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune ressource disponible</p>
        </div>
      )}
    </div>
  );
}
