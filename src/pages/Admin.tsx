import { useState, useEffect } from 'react';
import { Plus, Loader, Shield, ArrowLeft, Palette, Tag, MessageCircle, Eye, EyeOff, Building2, BarChart3, LogOut } from 'lucide-react';
import { supabase, Resource, Theme, ResourceType } from '../lib/supabase';
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
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
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
      console.error('Erreur auth:', error);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [themesRes, resourcesRes, typesRes] = await Promise.all([
        supabase.from('themes').select('*').order('title'),
        supabase.from('resources').select('*, theme:themes(*), resource_type:resource_types(*)').order('title'),
        supabase.from('resource_types').select('*').order('name')
      ]);

      if (themesRes.error) throw themesRes.error;
      if (resourcesRes.error) throw resourcesRes.error;
      if (typesRes.error) throw typesRes.error;

      setThemes(themesRes.data || []);
      setResources(resourcesRes.data || []);
      setResourceTypes(typesRes.data || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoginError('Identifiants incorrects.');
        setLoading(false);
      } else if (data.session) {
        setIsAuthenticated(true);
        fetchData();
      }
    } catch (err) {
      setLoginError('Une erreur est survenue.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-slate-200">
          <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-[#E8650A]" />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-6">Administration CyberKit</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#E8650A]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#E8650A]" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {loginError && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{loginError}</p>}
            <button type="submit" disabled={loading} className="w-full bg-[#E8650A] text-white py-3 rounded-lg font-bold hover:bg-[#d15809] transition-colors disabled:opacity-50">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium">
            <ArrowLeft className="w-5 h-5" /> Retour au site
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 text-sm">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex border-b border-slate-200">
            {[
              { id: 'resources', label: 'Ressources', icon: null },
              { id: 'themes', label: 'Thèmes', icon: Palette },
              { id: 'tags', label: 'Tags', icon: Tag },
              { id: 'chatbot', label: 'Chatbot', icon: MessageCircle },
              { id: 'companies', label: 'Entreprises', icon: Building2 },
              { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setShowForm(false); }}
                className={`px-6 py-4 font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'border-[#E8650A] text-[#E8650A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader className="w-10 h-10 animate-spin text-slate-300" /></div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'resources' && (
              !showForm ? (
                <>
                  <button onClick={() => { setEditingResource(null); setShowForm(true); }} className="bg-[#E8650A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all">
                    <Plus className="w-5 h-5" /> Ajouter une ressource
                  </button>
                  <ResourceList resources={resources} onEdit={(r) => { setEditingResource(r); setShowForm(true); }} onDelete={fetchData} />
                </>
              ) : (
                <ResourceForm
                  themes={themes}
                  resourceTypes={resourceTypes}
                  resource={editingResource}
                  onSuccess={() => { setShowForm(false); fetchData(); }}
                  onCancel={() => setShowForm(false)}
                />
              )
            )}

            {activeTab === 'themes' && (
              !showThemeForm ? (
                <>
                  <button onClick={() => { setEditingTheme(null); setShowThemeForm(true); }} className="bg-[#E8650A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Ajouter un thème
                  </button>
                  <ThemeList themes={themes} onEdit={(t) => { setEditingTheme(t); setShowThemeForm(true); }} onDelete={fetchData} />
                </>
              ) : (
                <ThemeForm theme={editingTheme} onSuccess={() => { setShowThemeForm(false); fetchData(); }} onCancel={() => setShowThemeForm(false)} />
              )
            )}

            {activeTab === 'tags' && <KeywordManager />}
            {activeTab === 'chatbot' && <ChatbotAnalytics />}
            {activeTab === 'companies' && <CompaniesManager />}
            {activeTab === 'statistics' && <StatisticsPanel />}
          </div>
        )}
      </div>
    </div>
  );
}