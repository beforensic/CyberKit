import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { Resource, supabase } from '../lib/supabase';
import {
  LayoutDashboard, BookOpen, Plus,
  LogOut, ChevronLeft, Shield, Filter, Tag,
  ClipboardList, BarChart3, Mail
} from 'lucide-react';

// IMPORTATION BASÉE SUR TON ARBORESCENCE RÉELLE
import ResourceList from '../components/admin/ResourceList';
import ResourceForm from '../components/admin/ResourceForm';
import { useResources } from '../hooks/useResources';
import QuestionList from '../components/admin/QuestionList'; // Celui que nous venons de créer
import ThemeList from '../components/admin/ThemeList';
import KeywordManager from '../components/admin/KeywordManager'; // Corrigé (au lieu de TagList)
import StatisticsPanel from '../components/admin/StatisticsPanel';
import ContactMessagesPanel, { fetchNewContactCount } from '../components/admin/ContactMessagesPanel';
import { hasAdminRoleInSession } from '../utils/adminAccess';

export default function Admin() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'messages' | 'resources' | 'questions' | 'themes' | 'keywords'>('stats');
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const { refetch: refetchResources } = useResources();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [serverAdminOk, setServerAdminOk] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setServerAdminOk(null);
      return;
    }

    fetchNewContactCount().then(setNewMessageCount);

    supabase
      .rpc('admin_check_access')
      .then(({ data, error }) => {
        if (error) {
          console.error('admin_check_access:', error);
          setServerAdminOk(false);
          return;
        }
        setServerAdminOk(Boolean(data));
      });
  }, [session?.user?.id]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      setLoginSubmitting(false);
      return;
    }

    if (data.session) {
      setSession(data.session);
    }
    setLoginSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-orange"></div></div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl text-left">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-orange">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Console CyberKit</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {loginError && (
              <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium">
                {loginError}
              </div>
            )}
            <div>
              <label htmlFor="admin-email" className="sr-only">Adresse email</label>
              <input
                id="admin-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={loginError ? true : undefined}
                className="focus-ring w-full p-4 bg-slate-50 border-none rounded-2xl"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="sr-only">Mot de passe</label>
              <input
                id="admin-password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={loginError ? true : undefined}
                className="focus-ring w-full p-4 bg-slate-50 border-none rounded-2xl"
              />
            </div>
            <button
              type="submit"
              disabled={loginSubmitting}
              className="focus-ring w-full py-4 bg-brand-orange text-white rounded-2xl font-bold shadow-lg shadow-brand-orange/20 disabled:opacity-60"
            >
              {loginSubmitting ? 'Connexion…' : 'Se connecter'}
            </button>
            <button type="button" onClick={() => navigate('/')} className="focus-ring w-full text-slate-400 text-sm font-bold pt-2">
              Retour au site
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-left">
      <div className="w-72 bg-slate-900 text-white flex flex-col fixed h-full z-30">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-brand-orange p-2 rounded-xl"><LayoutDashboard className="w-6 h-6" /></div>
            <span className="font-black text-xl italic tracking-tighter uppercase">CyberKit</span>
          </div>
          <nav className="space-y-2">
            <NavItem active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={20} />} label="Statistiques" />
            <NavItem
              active={activeTab === 'messages'}
              onClick={() => setActiveTab('messages')}
              icon={<Mail size={20} />}
              label="Messages"
              badge={newMessageCount > 0 ? newMessageCount : undefined}
            />
            <NavItem active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} icon={<BookOpen size={20} />} label="Ressources" />
            <NavItem active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} icon={<ClipboardList size={20} />} label="Diagnostic" />
            <NavItem active={activeTab === 'themes'} onClick={() => setActiveTab('themes')} icon={<Filter size={20} />} label="Thématiques" />
            <NavItem active={activeTab === 'keywords'} onClick={() => setActiveTab('keywords')} icon={<Tag size={20} />} label="Mots-clés" />
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-slate-800">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 text-slate-400 hover:text-white mb-4 w-full px-4 font-bold transition-colors">
            <ChevronLeft size={20} /> Site public
          </button>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 font-bold transition-colors">
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </div>

      <div className="flex-1 ml-72 p-12">
        <div className="max-w-6xl mx-auto">
          {serverAdminOk === false && (
            <div
              className="mb-8 p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950"
              role="alert"
            >
              <p className="font-bold text-lg mb-2">Droits administrateur manquants</p>
              <p className="text-sm leading-relaxed mb-3">
                Votre compte est connecté mais Supabase refuse les modifications (rôle{' '}
                <code className="bg-amber-100 px-1 rounded">admin</code> absent).
              </p>
              <ol className="text-sm list-decimal list-inside space-y-1 mb-3">
                <li>
                  Supabase → SQL Editor : exécuter{' '}
                  <code className="bg-amber-100 px-1 rounded">supabase/scripts/grant_cyberkit_admin.sql</code>{' '}
                  avec votre email admin
                </li>
                <li>Appliquer la migration <code className="bg-amber-100 px-1 rounded">20260525210000_is_cyberkit_admin_from_auth_users.sql</code></li>
                <li>Se déconnecter puis se reconnecter sur cette page</li>
              </ol>
              {!hasAdminRoleInSession(session) && (
                <p className="text-xs text-amber-800">
                  JWT actuel : pas de rôle admin visible — normal avant la procédure ci-dessus.
                </p>
              )}
            </div>
          )}

          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 capitalize">{activeTab}</h1>
            </div>
            {activeTab === 'resources' && (
              <button
                onClick={() => { setEditingResource(null); setShowResourceForm(true); }}
                className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all"
              >
                <Plus size={24} /> Ajouter
              </button>
            )}
          </header>

          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
            {activeTab === 'stats' && <StatisticsPanel />}
            {activeTab === 'messages' && (
              <ContactMessagesPanel onMessageCountChange={setNewMessageCount} />
            )}
            {activeTab === 'resources' && <ResourceList onEdit={(r) => { setEditingResource(r); setShowResourceForm(true); }} />}
            {activeTab === 'questions' && <QuestionList />}
            {activeTab === 'themes' && <ThemeList />}
            {activeTab === 'keywords' && <KeywordManager />}
          </div>
        </div>
      </div>

      {showResourceForm && (
        <ResourceForm
          resource={editingResource}
          onClose={() => {
            setShowResourceForm(false);
            setEditingResource(null);
          }}
          onSaved={async () => {
            await refetchResources();
          }}
        />
      )}
    </div>
  );
}

function NavItem({ active, onClick, icon, label, badge }: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span className={`text-[10px] font-black min-w-[1.25rem] h-5 px-1.5 rounded-full flex items-center justify-center ${active ? 'bg-white text-brand-orange' : 'bg-brand-orange text-white'}`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}