import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, BookOpen, Settings, Plus,
  LogOut, ChevronLeft, Shield, Filter, Tag,
  ClipboardList, BarChart3, MessageSquare
} from 'lucide-react';

// Importation des composants de gestion (basé sur ton arborescence)
import ResourceList from '../components/admin/ResourceList';
import ResourceForm from '../components/admin/ResourceForm';
import QuestionList from '../components/admin/QuestionList';
import ThemeList from '../components/admin/ThemeList';
import KeywordManager from '../components/admin/KeywordManager';
import StatisticsPanel from '../components/admin/StatisticsPanel';
import ChatbotAnalytics from '../components/admin/ChatbotAnalytics';

export default function Admin({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'resources' | 'questions' | 'themes' | 'keywords' | 'chatbot'>('stats');
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erreur : " + error.message);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#E8650A]"></div>
    </div>
  );

  // --- ECRAN DE CONNEXION ---
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl text-left">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#E8650A]">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Console CyberKit</h1>
            <p className="text-slate-500">Espace d'administration sécurisé</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Email professionnel</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="admin@cyberkit.be"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            <button className="w-full py-4 bg-[#E8650A] text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all">
              Se connecter
            </button>
            <button type="button" onClick={() => onNavigate('home')} className="w-full text-slate-400 text-sm font-bold pt-2">
              Retour au site
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- INTERFACE ADMIN COMPLÈTE ---
  return (
    <div className="min-h-screen bg-slate-50 flex text-left">
      {/* Sidebar Restaurée */}
      <div className="w-72 bg-slate-900 text-white flex flex-col fixed h-full z-30">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-[#E8650A] p-2 rounded-xl">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter italic">CYBERKIT</span>
          </div>

          <nav className="space-y-2">
            <NavItem active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={20} />} label="Statistiques" />
            <NavItem active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} icon={<BookOpen size={20} />} label="Ressources" />
            <NavItem active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} icon={<ClipboardList size={20} />} label="Diagnostic" />
            <NavItem active={activeTab === 'themes'} onClick={() => setActiveTab('themes')} icon={<Filter size={20} />} label="Thématiques" />
            <NavItem active={activeTab === 'keywords'} onClick={() => setActiveTab('keywords')} icon={<Tag size={20} />} label="Mots-clés" />
            <NavItem active={activeTab === 'chatbot'} onClick={() => setActiveTab('chatbot')} icon={<MessageSquare size={20} />} label="Analytics Chat" />
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4 font-bold">
            <ChevronLeft size={20} /> Voir le site
          </button>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full px-4 font-bold">
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Zone de contenu */}
      <div className="flex-1 ml-72 p-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 capitalize">{activeTab}</h1>
              <p className="text-slate-500 mt-2">Gestion du contenu et des analyses</p>
            </div>

            {activeTab === 'resources' && (
              <button
                onClick={() => { setEditingResource(null); setShowResourceForm(true); }}
                className="bg-[#E8650A] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-orange-500/20 hover:scale-105 transition-all"
              >
                <Plus size={24} /> Nouvelle ressource
              </button>
            )}
          </header>

          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
            {activeTab === 'stats' && <StatisticsPanel />}
            {activeTab === 'resources' && <ResourceList onEdit={(r) => { setEditingResource(r); setShowResourceForm(true); }} />}
            {activeTab === 'questions' && <QuestionList />}
            {activeTab === 'themes' && <ThemeList />}
            {activeTab === 'keywords' && <KeywordManager />}
            {activeTab === 'chatbot' && <ChatbotAnalytics />}
          </div>
        </div>
      </div>

      {/* Modal Formulaire Ressource */}
      {showResourceForm && (
        <ResourceForm
          resource={editingResource}
          onClose={() => setShowResourceForm(false)}
        />
      )}
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${active
          ? 'bg-[#E8650A] text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}