import { useState } from 'react';
import { Mail, Lock, Building2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CompanyLoginProps {
  onNavigate: (page: string) => void;
}

export default function CompanyLogin({ onNavigate }: CompanyLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      if (data.user) {
        const { data: member, error: memberError } = await supabase
          .from('company_members')
          .select('role, company_id, status')
          .eq('user_id', data.user.id)
          .single();

        if (memberError || !member) {
          await supabase.auth.signOut();
          throw new Error('Aucune entreprise associée à ce compte');
        }

        if (member.status !== 'active') {
          await supabase.auth.signOut();
          throw new Error('Votre compte n\'a pas encore été activé');
        }

        if (member.role === 'admin') {
          onNavigate('company-dashboard');
        } else {
          onNavigate('company-member');
        }
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Veuillez entrer votre email pour réinitialiser votre mot de passe');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) throw resetError;

      setResetEmailSent(true);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError('Impossible d\'envoyer l\'email de réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  if (resetEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 pb-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Email envoyé !
            </h2>
            <p className="text-slate-600 mb-6">
              Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
              Vérifiez votre boîte de réception.
            </p>
            <button
              onClick={() => setResetEmailSent(false)}
              className="text-[#E8650A] hover:underline font-medium"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 pb-20">
      <div className="max-w-md w-full">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour à l'accueil</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#E8650A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Espace entreprise
          </h1>
          <p className="text-slate-600">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email professionnel
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E8650A] focus:border-transparent"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E8650A] focus:border-transparent"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8650A] text-white py-3 rounded-lg font-semibold hover:bg-[#d15809] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="text-sm text-[#E8650A] hover:underline font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600 mb-2">
              Vous n'avez pas encore de compte ?
            </p>
            <button
              onClick={() => onNavigate('company-signup')}
              className="text-[#E8650A] hover:underline font-medium"
            >
              Créer un espace entreprise
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
