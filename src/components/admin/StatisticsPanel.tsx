import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, TrendingUp, Eye, Search, Loader, FileText, Calendar, Trash2 } from 'lucide-react';

interface DiagnosticStats {
  total: number;
  averageScore: number;
  scoreDistribution: {
    range: string;
    count: number;
  }[];
}

interface ResourceStats {
  topResources: {
    id: string;
    title: string;
    views: number;
  }[];
  typeDistribution: {
    type: string;
    count: number;
  }[];
}

interface SearchStats {
  topSearches: {
    query: string;
    count: number;
    averageResults: number;
  }[];
}

type PeriodFilter = 'all' | 'year' | 'quarter' | 'month';

export default function StatisticsPanel() {
  const [loading, setLoading] = useState(true);
  const [diagnosticStats, setDiagnosticStats] = useState<DiagnosticStats | null>(null);
  const [resourceStats, setResourceStats] = useState<ResourceStats | null>(null);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [periodFilter]);

  const getDateFilter = (): string | null => {
    const now = new Date();
    switch (periodFilter) {
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return yearStart.toISOString();
      case 'quarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        const quarterStart = new Date(now.getFullYear(), quarterMonth, 1);
        return quarterStart.toISOString();
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return monthStart.toISOString();
      default:
        return null;
    }
  };

  const loadStatistics = async () => {
    try {
      setLoading(true);

      const [diagnostics, resources, searches] = await Promise.all([
        loadDiagnosticStats(),
        loadResourceStats(),
        loadSearchStats()
      ]);

      setDiagnosticStats(diagnostics);
      setResourceStats(resources);
      setSearchStats(searches);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiagnosticStats = async (): Promise<DiagnosticStats> => {
    const dateFilter = getDateFilter();
    let query = supabase.from('diagnostic_completions').select('score');

    if (dateFilter) {
      query = query.gte('completed_at', dateFilter);
    }

    const { data: completions } = await query;

    if (!completions || completions.length === 0) {
      return {
        total: 0,
        averageScore: 0,
        scoreDistribution: [
          { range: '0-25%', count: 0 },
          { range: '25-50%', count: 0 },
          { range: '50-75%', count: 0 },
          { range: '75-100%', count: 0 }
        ]
      };
    }

    const total = completions.length;
    const averageScore = Math.round(
      completions.reduce((sum, c) => sum + c.score, 0) / total
    );

    const distribution = [
      { range: '0-25%', count: completions.filter(c => c.score <= 25).length },
      { range: '25-50%', count: completions.filter(c => c.score > 25 && c.score <= 50).length },
      { range: '50-75%', count: completions.filter(c => c.score > 50 && c.score <= 75).length },
      { range: '75-100%', count: completions.filter(c => c.score > 75).length }
    ];

    return { total, averageScore, scoreDistribution: distribution };
  };

  const loadResourceStats = async (): Promise<ResourceStats> => {
    const dateFilter = getDateFilter();
    let query = supabase
      .from('resource_views')
      .select('resource_id, resource_type, resources(id, title)');

    if (dateFilter) {
      query = query.gte('viewed_at', dateFilter);
    }

    const { data: views } = await query;

    if (!views || views.length === 0) {
      return {
        topResources: [],
        typeDistribution: []
      };
    }

    const resourceCounts = views.reduce((acc: Record<string, { title: string; count: number }>, view: any) => {
      if (view.resources?.id) {
        const id = view.resources.id;
        if (!acc[id]) {
          acc[id] = { title: view.resources.title || 'Sans titre', count: 0 };
        }
        acc[id].count++;
      }
      return acc;
    }, {});

    const topResources = Object.entries(resourceCounts)
      .map(([id, data]) => ({ id, title: data.title, views: data.count }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const typeCounts = views.reduce((acc: Record<string, number>, view: any) => {
      const type = view.resource_type || 'Autre';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const typeDistribution = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return { topResources, typeDistribution };
  };

  const loadSearchStats = async (): Promise<SearchStats> => {
    const dateFilter = getDateFilter();
    let query = supabase
      .from('search_queries')
      .select('query, results_count');

    if (dateFilter) {
      query = query.gte('searched_at', dateFilter);
    }

    const { data: queries } = await query;

    if (!queries || queries.length === 0) {
      return { topSearches: [] };
    }

    const queryStats = queries.reduce((acc: Record<string, { count: number; totalResults: number }>, q: any) => {
      const queryText = q.query?.toLowerCase() || '';
      if (!acc[queryText]) {
        acc[queryText] = { count: 0, totalResults: 0 };
      }
      acc[queryText].count++;
      acc[queryText].totalResults += q.results_count || 0;
      return acc;
    }, {});

    const topSearches = Object.entries(queryStats)
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        averageResults: Math.round(stats.totalResults / stats.count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { topSearches };
  };

  const handleResetStatistics = async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer toutes les statistiques ? Cette action est irréversible.'
    );

    if (!confirmed) return;

    try {
      setResetting(true);

      await Promise.all([
        supabase.from('diagnostic_completions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('resource_views').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('search_queries').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);

      alert('Toutes les statistiques ont été supprimées avec succès.');

      await loadStatistics();
    } catch (error) {
      console.error('Erreur lors de la suppression des statistiques:', error);
      alert('Une erreur est survenue lors de la suppression des statistiques.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Période d'analyse</h2>
              <p className="text-sm text-gray-600">Filtrer toutes les statistiques</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                periodFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setPeriodFilter('year')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                periodFilter === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cette année
            </button>
            <button
              onClick={() => setPeriodFilter('quarter')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                periodFilter === 'quarter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ce trimestre
            </button>
            <button
              onClick={() => setPeriodFilter('month')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                periodFilter === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ce mois-ci
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <BarChart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Statistiques des diagnostics</h2>
            <p className="text-sm text-gray-600">Données agrégées et anonymes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-gray-700">Total complétés</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{diagnosticStats?.total || 0}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-gray-700">Score moyen</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{diagnosticStats?.averageScore || 0}%</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des scores</h3>
          <div className="space-y-3">
            {diagnosticStats?.scoreDistribution.map((dist, index) => {
              const maxCount = Math.max(...(diagnosticStats?.scoreDistribution.map(d => d.count) || [1]));
              const percentage = maxCount > 0 ? (dist.count / maxCount) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{dist.range}</span>
                    <span className="text-sm font-bold text-gray-900">{dist.count}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Eye className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Statistiques des ressources</h2>
            <p className="text-sm text-gray-600">Ressources les plus consultées</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 des ressources</h3>
          {resourceStats?.topResources && resourceStats.topResources.length > 0 ? (
            <div className="space-y-3">
              {resourceStats.topResources.map((resource, index) => (
                <div key={resource.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{resource.title}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                      {resource.views} vues
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par type</h3>
          {resourceStats?.typeDistribution && resourceStats.typeDistribution.length > 0 ? (
            <div className="space-y-3">
              {resourceStats.typeDistribution.map((type, index) => {
                const maxCount = Math.max(...(resourceStats?.typeDistribution.map(t => t.count) || [1]));
                const percentage = maxCount > 0 ? (type.count / maxCount) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{type.type}</span>
                      <span className="text-sm font-bold text-gray-900">{type.count} consultations</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-lg">
            <Search className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Statistiques des recherches</h2>
            <p className="text-sm text-gray-600">Termes les plus recherchés</p>
          </div>
        </div>

        {searchStats?.topSearches && searchStats.topSearches.length > 0 ? (
          <div className="space-y-3">
            {searchStats.topSearches.map((search, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{search.query}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700">
                    {search.count} recherche{search.count > 1 ? 's' : ''}
                  </span>
                  {search.averageResults === 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                      0 résultat
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      {search.averageResults} résultat{search.averageResults > 1 ? 's' : ''} (moy.)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Trash2 className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gestion des statistiques</h2>
              <p className="text-sm text-gray-600">Supprimer toutes les données de suivi</p>
            </div>
          </div>
          <button
            onClick={handleResetStatistics}
            disabled={resetting}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {resetting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Réinitialiser les statistiques
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
