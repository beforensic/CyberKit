import { useState, useEffect } from 'react';
import { Plus, Loader, Shield, ArrowLeft, Palette, Tag, MessageCircle, Eye, EyeOff, Building2, BarChart3 } from 'lucide-react';
import { supabase, Resource, Theme } from '../lib/supabase';
import ResourceList from '../components/admin/ResourceList';
import ResourceForm from '../components/admin/ResourceForm';
import ThemeList from '../components/admin/ThemeList';
import ThemeForm from '../components/admin/ThemeForm';
import KeywordManager from '../components/admin/KeywordManager';
import ChatbotAnalytics from '../components/admin/ChatbotAnalytics';
import CompaniesManager from '../components/admin/CompaniesManager';
import StatisticsPanel from '../components/admin/StatisticsPanel';

interface AdminProps {
  onNavigate: (page: 'home' | 'quiz' | 'resources' | 'contact' | 'admin') => void;
}

export default function Admin({ onNavigate }: AdminProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'resources' | 'themes' | 'tags' | 'chatbot' | 'companies' | 'statistics'>('resources');
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showThemeForm, setShowThemeForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur de vérification auth:', error);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        setLoginError('Email ou mot de passe incorrect.');
        setLoading(false);
        return;
      }

      if (data.session) {
        setIsAuthenticated(true);
        fetchData();
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setLoginError('Une erreur est survenue lors de la connexion.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [themesResponse, resourcesResponse] = await Promise.all([
        supabase.from('themes').select('*').order('title'),
        supabase
          .from('resources')
          .select(`
            *,
            theme:themes(*),
            resource_type:resource_types(*)
          `)
          .order('title', { ascending: true })
      ]);

      if (themesResponse.error) throw themesResponse.error;
      if (resourcesResponse.error) throw resourcesResponse.error;

      setThemes(themesResponse.data || []);
      setResources(resourcesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      return;
    }

    try {
      const { error } = await supabase.from('resources').delete().eq('id', id);

      if (error) throw error;

      setResources(resources.filter((r) => r.id !== id));
      alert('Ressource supprimée avec succès');
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingResource(null);
    fetchData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingResource(null);
  };

  const handleEditTheme = (theme: Theme) => {
    setEditingTheme(theme);
    setShowThemeForm(true);
  };

  const handleDeleteTheme = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce thème ?')) {
      return;
    }

    try {
      const { error } = await supabase.from('themes').delete().eq('id', id);

      if (error) throw error;

      setThemes(themes.filter((t) => t.id !== id));
      alert('Thème supprimé avec succès');
    } catch (error) {
      console.error('Error deleting theme:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleThemeFormSuccess = () => {
    setShowThemeForm(false);
    setEditingTheme(null);
    fetchData();
  };

  const handleThemeFormCancel = () => {
    setShowThemeForm(false);
    setEditingTheme(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full">
              <Shield className="w-8 h-8 text-[#E8650A]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Administration
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Veuillez vous authentifier pour accéder à l'administration
          </p>
          <form onSubmit={handleLogin} action="" method="post" className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#E8650A] transition-colors"
                placeholder="Entrez votre email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#E8650A] transition-colors pr-12"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8650A] text-white py-3 rounded-lg font-semibold hover:bg-[#d15809] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour à l'accueil</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Administration CyberKit
            </h1>
            <p className="text-gray-600">
              Gérez les ressources de cybersécurité
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Déconnexion
          </button>
        </div>

        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('resources');
              setShowForm(false);
              setShowThemeForm(false);
            }}
            className={`px-4 py-3 font-semibold transition-colors ${activeTab === 'resources'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Ressources
          </button>
          <button
            onClick={() => {
              setActiveTab('themes');
              setShowForm(false);
              setShowThemeForm(false);
            }}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'themes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Palette className="w-5 h-5" />
            Thèmes
          </button>
          <button
            onClick={() => {
              setActiveTab('tags');
              setShowForm(false);
              setShowThemeForm(false);
            }}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'tags'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Tag className="w-5 h-5" />
            Tags
          </button>
          <button
            onClick={() => {
              setActiveTab('chatbot');
              setShowForm(false);
              setShowThemeForm(false);
            }}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'chatbot'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <MessageCircle className="w-5 h-5" />
            Chatbot
          </button>
          <button
            onClick={() => {
              setActiveTab('companies');
              setShowForm(false);
              setShowThemeForm(false);
            }}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'companies'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Building2 className="w-5 h-5" />
            Entreprises
          </button>
          <button
            onClick={() => {
              setActiveTab('statistics');
              setShowForm(false);
              setShowThemeForm(false);
            }}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'statistics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            Statistiques
          </button>
        </div>

        {activeTab === 'resources' ? (
          !showForm ? (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter une ressource
                </button>
              </div>

              <ResourceList
                resources={resources}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </>
          ) : (
            <ResourceForm
              themes={themes}
              resource={editingResource}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )
        ) : activeTab === 'themes' ? (
          !showThemeForm ? (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setShowThemeForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un thème
                </button>
              </div>

              <ThemeList
                themes={themes}
                onEdit={handleEditTheme}
                onDelete={handleDeleteTheme}
              />
            </>
          ) : (
            <ThemeForm
              theme={editingTheme}
              onSuccess={handleThemeFormSuccess}
              onCancel={handleThemeFormCancel}
            />
          )
        ) : activeTab === 'tags' ? (
          <KeywordManager />
        ) : activeTab === 'chatbot' ? (
          <ChatbotAnalytics />
        ) : activeTab === 'companies' ? (
          <CompaniesManager />
        ) : (
          <StatisticsPanel />
        )}
      </div>
    </div>
  );
}
