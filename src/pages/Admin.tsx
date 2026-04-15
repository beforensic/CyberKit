import { useState, useEffect } from 'react';
import { Plus, Loader, Shield, ArrowLeft, Palette, Tag, MessageCircle, Eye, EyeOff, Building2, BarChart3 } from 'lucide-react';
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
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [themesRes, resourcesRes, typesRes] = await Promise.all([
        supabase.from('themes').select('*').order('title'),
        supabase.from('resources').select('*, theme:themes(*)').order('title'),
        supabase.from('resource_types').select('*').order('name')
      ]);

      setThemes(themesRes.data || []);
      setResources(resourcesRes.data || []);
      setResourceTypes(typesRes.data || []);
    } catch (error) {
      console.error('Erreur fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError('Email ou mot de passe incorrect.');
      setLoading(false);
    } else if (data.session) {
      setIsAuthenticated(true);
      fetchData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <Shield className="w-12 h-12 text-[#E8650A] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-center mb-6">Administration</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Email" required />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Mot de passe" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">{showPassword ? <EyeOff /> : <Eye />}</button>
            </div>
            {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-[#E8650A] text-white py-3 rounded-lg font-bold">Se connecter</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-600 mb-8"><ArrowLeft /> Accueil</button>

        <div className="flex border-b mb-8 overflow-x-auto">
          {['resources', 'themes', 'tags', 'chatbot', 'companies', 'statistics'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as any); setShowForm(false); }}
              className={`px-4 py-3 font-bold capitalize ${activeTab === tab ? 'text-[#E8650A] border-b-2 border-[#E8650A]' : 'text-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'resources' ? (
          !showForm ? (
            <>
              <button onClick={() => { setEditingResource(null); setShowForm(true); }} className="bg-[#E8650A] text-white px-6 py-3 rounded-lg font-bold mb-6 flex items-center gap-2">
                <Plus /> Ajouter une ressource
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
        ) : activeTab === 'themes' ? (
          <ThemeList themes={themes} onDelete={fetchData} onEdit={() => { }} />
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