import { Check, X, Building2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CompanyPlansProps {
  onNavigate: (page: string, filter?: string, contactData?: { subject?: string }) => void;
}

export default function CompanyPlans({ onNavigate }: CompanyPlansProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentCompany, setCurrentCompany] = useState<any>(null);
  const [showCancelMessage, setShowCancelMessage] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        const { data: member } = await supabase
          .from('company_members')
          .select('company_id, role')
          .eq('user_id', session.user.id)
          .single();

        if (member) {
          const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('id', member.company_id)
            .single();

          if (company) {
            setCurrentCompany(company);
          }
        }
      }
    };

    checkAuth();

    const params = new URLSearchParams(window.location.search);
    if (params.get('cancelled') === 'true') {
      setShowCancelMessage(true);
      setTimeout(() => setShowCancelMessage(false), 5000);
    }
  }, []);

  const handlePremiumUpgrade = () => {
    if (!currentUser || !currentCompany) {
      onNavigate('company-signup');
      window.history.pushState({}, '', '/entreprise/inscription?plan=premium');
      return;
    }

    onNavigate('contact', undefined, { subject: 'Demande de passage au plan Premium — 19€/mois' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour à l'accueil</span>
          </button>
          {currentUser && currentCompany ? (
            <button
              onClick={() => onNavigate('company-dashboard')}
              className="px-4 py-2 border-2 border-[#E8650A] text-[#E8650A] bg-white rounded-lg font-medium hover:bg-orange-50 transition-colors"
            >
              Mon tableau de bord
            </button>
          ) : (
            <button
              onClick={() => onNavigate('company-login')}
              className="px-4 py-2 border-2 border-[#E8650A] text-[#E8650A] bg-white rounded-lg font-medium hover:bg-orange-50 transition-colors"
            >
              Se connecter
            </button>
          )}
        </div>

        {showCancelMessage && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            Le paiement a été annulé. Vous pouvez réessayer à tout moment.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#E8650A] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            SecuriCoach pour les entreprises
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Sensibilisez toute votre équipe à la cybersécurité, simplement et efficacement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-slate-200">
            <div className="mb-6">
              <div className="inline-block px-4 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold mb-4">
                Gratuit
              </div>
              <div className="mb-2">
                <span className="text-5xl font-bold text-slate-900">0€</span>
                <span className="text-slate-600 ml-2">/ mois</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Jusqu'à 3 collaborateurs</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Tableau de bord équipe</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Diagnostic personnalisé</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Accès à toutes les ressources</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Export PDF rapport équipe</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Support prioritaire</span>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('company-signup')}
              className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-all"
            >
              Créer mon espace gratuit
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#E8650A] relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1 bg-[#E8650A] text-white rounded-full text-sm font-semibold">
              Recommandé
            </div>

            <div className="mb-6">
              <div className="inline-block px-4 py-1 bg-orange-100 text-[#E8650A] rounded-full text-sm font-semibold mb-4">
                Premium
              </div>
              <div className="mb-2">
                <span className="text-5xl font-bold text-slate-900">19€</span>
                <span className="text-slate-600 ml-2">/ mois</span>
              </div>
              <p className="text-sm text-slate-500">
                Sans engagement — résiliable à tout moment
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium">Collaborateurs illimités</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Tableau de bord équipe</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Diagnostic personnalisé pour chaque membre</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Accès à toutes les ressources</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Export PDF rapport équipe</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Support prioritaire par email</span>
              </li>
            </ul>

            <button
              onClick={handlePremiumUpgrade}
              disabled={currentCompany?.status === 'paid'}
              className="w-full bg-[#E8650A] text-white py-3 rounded-lg font-semibold hover:bg-[#d15809] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentCompany?.status === 'paid' ? 'Déjà Premium' : 'Passer au Premium — Nous contacter'}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600 mb-4">
            Vous avez déjà un compte ?
          </p>
          <button
            onClick={() => onNavigate('company-login')}
            className="text-[#E8650A] hover:underline font-medium"
          >
            Se connecter à mon espace
          </button>
        </div>
      </div>
    </div>
  );
}
