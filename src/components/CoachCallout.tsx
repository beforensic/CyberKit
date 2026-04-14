import { useState, useEffect } from 'react';
import { Info, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getIconComponent } from '../utils/icons';

interface ResourceType {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  color: string;
  order: number;
}

const colorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
};

export default function CoachCallout() {
  const [isOpen, setIsOpen] = useState(false);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && resourceTypes.length === 0) {
      fetchResourceTypes();
    }
  }, [isOpen]);

  const fetchResourceTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resource_types')
        .select('*')
        .order('order');

      if (error) throw error;
      setResourceTypes(data || []);
    } catch (error) {
      console.error('Error fetching resource types:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-emerald-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between gap-3 hover:bg-emerald-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-900 text-base">
              Option Coach : Bien choisir votre ressource
            </h3>
            <p className="text-slate-600 text-sm">
              Découvrez nos types de contenus adaptés à vos besoins
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-emerald-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-emerald-600" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-emerald-100 bg-gradient-to-b from-emerald-50/30 to-white">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
          ) : (
            <div className="pt-4 space-y-4">
              {resourceTypes.map((type) => {
                const IconComponent = getIconComponent(type.icon_name);
                const colors = colorClasses[type.color] || colorClasses.blue;

                const displayName = `Les ${type.name.toLowerCase()}s`;

                return (
                  <div key={type.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                    <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{displayName}</h4>
                      <p className="text-slate-600 text-sm">
                        {type.description}
                      </p>
                    </div>
                  </div>
                );
              })}

              <p className="text-slate-500 text-xs italic mt-4 text-center px-4">
                Même s'ils portent des noms similaires, leur contenu est complémentaire !
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
