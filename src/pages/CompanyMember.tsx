import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  Calendar,
  LogOut
} from 'lucide-react';

interface CompanyMemberProps {
  onNavigate: (page: 'home' | 'quiz' | 'resources' | 'company-login') => void;
}

interface Company {
  name: string;
}

interface Member {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface Diagnostic {
  score: number;
  risk_level: string;
  completed_at: string;
}

export default function CompanyMember({ onNavigate }: CompanyMemberProps) {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        onNavigate('company-login');
        return;
      }

      const { data: pendingMember } = await supabase
        .from('company_members')
        .select('*, companies(*)')
        .eq('email', session.user.email)
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingMember) {
        const { error: activationError } = await supabase
          .from('company_members')
          .update({
            user_id: session.user.id,
            status: 'active',
            activated_at: new Date().toISOString()
          })
          .eq('id', pendingMember.id);

        if (activationError) {
          console.error('Erreur activation:', activationError);
        }
      }

      const { data: memberData } = await supabase
        .from('company_members')
        .select('*, companies(*)')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!memberData) {
        onNavigate('company-login');
        return;
      }

      setCompany(memberData.companies as unknown as Company);
      setMember({
        id: memberData.id,
        first_name: memberData.first_name,
        last_name: memberData.last_name
      });

      const { data: diagnosticData } = await supabase
        .from('company_diagnostics')
        .select('*')
        .eq('member_id', memberData.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (diagnosticData) {
        setDiagnostic(diagnosticData);
      }

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('home');
  };

  const getRiskColor = (riskLevel: string) => {
    if (riskLevel.includes('élevé')) return 'text-red-600 bg-red-50 border-red-200';
    if (riskLevel.includes('progression')) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Se déconnecter</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
              Espace Entreprise
            </h1>
            <p className="text-slate-600">
              Bienvenue dans l'espace entreprise de {company?.name}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 border border-primary/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white font-bold">
                {member?.first_name?.[0] || '?'}
                {member?.last_name?.[0] || ''}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Bonjour {member?.first_name} {member?.last_name} !
            </h2>
            <p className="text-slate-600">
              Bienvenue dans votre espace de formation à la cybersécurité
            </p>
          </div>

          {diagnostic && (
            <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Votre dernier diagnostic</h3>
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">
                        {diagnostic.score}/100
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(diagnostic.risk_level)}`}>
                      {diagnostic.risk_level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Diagnostic complété le {new Date(diagnostic.completed_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('quiz')}
              className="bg-white hover:bg-slate-50 rounded-xl p-6 border border-slate-200 transition-all hover:shadow-lg group text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">
                    {diagnostic ? 'Refaire mon diagnostic' : 'Faire mon diagnostic'}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {diagnostic
                      ? 'Évaluez votre progression en cybersécurité'
                      : 'Évaluez vos connaissances en cybersécurité'}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('resources')}
              className="bg-white hover:bg-slate-50 rounded-xl p-6 border border-slate-200 transition-all hover:shadow-lg group text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">
                    Accéder aux ressources
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Parcourez nos ressources de formation
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {!diagnostic && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <ClipboardCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Commencez votre parcours
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Faites votre premier diagnostic pour évaluer votre niveau de sécurité et recevoir des recommandations personnalisées.
                </p>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Commencer le diagnostic
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
