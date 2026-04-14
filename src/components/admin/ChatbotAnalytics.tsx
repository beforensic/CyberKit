import { useState, useEffect } from 'react';
import { MessageCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ChatLog {
  id: string;
  created_at: string;
  session_id: string;
  question: string;
  reponse: string;
  ressources_ids: string[];
  resource_titles?: string;
}

interface ResourceWithCount {
  id: string;
  title: string;
  count: number;
}

export default function ChatbotAnalytics() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | 'all'>('30');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [topResources, setTopResources] = useState<ResourceWithCount[]>([]);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchLogs();
  }, [period]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('chat_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (period !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const logsWithTitles = await Promise.all(
        (data || []).map(async (log) => {
          if (log.ressources_ids && Array.isArray(log.ressources_ids) && log.ressources_ids.length > 0) {
            const { data: resources } = await supabase
              .from('resources')
              .select('title')
              .in('id', log.ressources_ids);

            const titles = resources && resources.length > 0
              ? resources.map(r => r.title).join(', ')
              : 'Aucune ressource recommandée';

            return { ...log, resource_titles: titles };
          }
          return { ...log, resource_titles: 'Aucune ressource recommandée' };
        })
      );

      setLogs(logsWithTitles);
      calculateTopResources(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTopResources = async (logData: ChatLog[]) => {
    const resourceCounts: Record<string, number> = {};
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    logData.forEach(log => {
      if (log.ressources_ids && Array.isArray(log.ressources_ids)) {
        log.ressources_ids.forEach(id => {
          if (uuidRegex.test(id)) {
            resourceCounts[id] = (resourceCounts[id] || 0) + 1;
          }
        });
      }
    });

    const sortedIds = Object.entries(resourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    if (sortedIds.length === 0) {
      setTopResources([]);
      return;
    }

    try {
      const { data: resources, error } = await supabase
        .from('resources')
        .select('id, title')
        .in('id', sortedIds);

      if (error) throw error;

      const resourcesWithCount: ResourceWithCount[] = sortedIds
        .map(id => {
          const resource = resources?.find(r => r.id === id);
          return resource ? {
            id,
            title: resource.title,
            count: resourceCounts[id]
          } : null;
        })
        .filter((r): r is ResourceWithCount => r !== null);

      setTopResources(resourcesWithCount);
    } catch (error) {
      console.error('Error fetching resource titles:', error);
      setTopResources([]);
    }
  };

  const getTotalQuestions = () => logs.length;

  const getTotalSessions = () => {
    const uniqueSessions = new Set(logs.map(log => log.session_id));
    return uniqueSessions.size;
  };

  const getAverageQuestionsPerSession = () => {
    const totalSessions = getTotalSessions();
    if (totalSessions === 0) return 0;
    return (getTotalQuestions() / totalSessions).toFixed(1);
  };

  const getSessionLogs = (sessionId: string) => {
    return logs
      .filter(log => log.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const paginatedLogs = logs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);

  const maxCount = topResources.length > 0 ? topResources[0].count : 1;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Statistiques du Chatbot</h2>
        </div>
        <p className="text-orange-100">
          Analyse des conversations et des ressources recommandées
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Période</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('7')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === '7'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              7 jours
            </button>
            <button
              onClick={() => setPeriod('30')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === '30'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              30 jours
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 text-sm font-medium">Questions posées</span>
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{getTotalQuestions()}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 text-sm font-medium">Conversations</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{getTotalSessions()}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 text-sm font-medium">Moyenne par conv.</span>
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900">{getAverageQuestionsPerSession()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Liste des questions</h3>

        {selectedSession ? (
          <div>
            <button
              onClick={() => setSelectedSession(null)}
              className="mb-4 text-orange-600 hover:text-orange-700 font-medium"
            >
              ← Retour à la liste
            </button>
            <div className="space-y-4">
              {getSessionLogs(selectedSession).map((log, index) => (
                <div key={log.id} className="border-l-4 border-orange-500 pl-4">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Q{index + 1}:</span>
                    <p className="text-gray-900 mt-1">{log.question}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">R{index + 1}:</span>
                    <p className="text-gray-700 mt-1">{log.reponse}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {paginatedLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune question pour cette période</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ressources</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="max-w-md truncate">{log.question}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="max-w-xs truncate" title={log.resource_titles}>
                              {log.resource_titles}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => setSelectedSession(log.session_id)}
                              className="text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Voir conversation
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ressources les plus recommandées
        </h3>

        {topResources.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune ressource recommandée pour cette période</p>
        ) : (
          <div className="space-y-3">
            {topResources.map((resource, index) => (
              <div key={resource.id} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">{resource.title}</span>
                    <span className="text-sm text-gray-600 font-semibold">{resource.count}×</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(resource.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
