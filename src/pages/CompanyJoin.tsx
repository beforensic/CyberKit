import { useState, useEffect } from 'react';
import { Building2, CheckCircle2, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CompanyJoinProps {
  invitationCode: string;
  onNavigate: (page: string) => void;
}

export default function CompanyJoin({ invitationCode, onNavigate }: CompanyJoinProps) {
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [error, setError] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    checkInvitationCode();
  }, [invitationCode]);

  const checkInvitationCode = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('id, name, max_members, is_active')
        .eq('invitation_code', invitationCode)
        .single();

      if (fetchError || !data) {
        throw new Error('Code d\'invitation invalide');
      }

      if (!data.is_active) {
        throw new Error('Cette entreprise n\'est plus active');
      }

      const { count } = await supabase
        .from('company_members')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', data.id)
        .eq('status', 'active');

      if (count && count >= data.max_members) {
        throw new Error('Cette entreprise a atteint le nombre maximum de membres');
      }

      const { data: member } = await supabase
        .from('company_members')
        .select('email')
        .eq('company_id', data.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (member?.email) {
        setInvitedEmail(member.email);

        // Envoyer automatiquement le magic link
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: member.email,
          options: {
            emailRedirectTo: 'https://securicoach-cybersec-l5z7.bolt.host/entreprise/membre',
            data: {
              first_name: '',
              last_name: ''
            }
          }
        });

        if (authError) {
          console.error('Erreur envoi OTP:', authError);
          throw new Error('Erreur lors de l\'envoi du lien de connexion');
        }
      }

      setCompany(data);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Ce lien d\'invitation n\'est pas valide ou a expiré.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    setResending(true);
    setResendSuccess(false);
    setError('');

    try {
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email: invitedEmail,
        options: {
          emailRedirectTo: 'https://securicoach-cybersec-l5z7.bolt.host/entreprise/membre',
        },
      });

      if (magicLinkError) throw magicLinkError;

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'envoi du lien. Veuillez réessayer.');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 pb-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E8650A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Vérification du code d'invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 pb-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Invitation invalide
          </h2>
          <p className="text-slate-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-[#E8650A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d15809] transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#E8650A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Vérifiez votre email
          </h1>
          <p className="text-slate-600">
            Invitation à rejoindre
          </p>
          <p className="text-xl font-bold text-[#E8650A] mt-2">
            {company.name}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-slate-700 text-center mb-2">
                Un lien de connexion a été envoyé à
              </p>
              <p className="text-[#E8650A] font-semibold text-center break-all">
                {invitedEmail}
              </p>
            </div>

            <p className="text-slate-600 text-center">
              Un lien de connexion a été envoyé à votre email. Cliquez dessus pour accéder à votre espace.
            </p>

            {resendSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
                <CheckCircle2 className="w-5 h-5 inline mr-2" />
                Email renvoyé avec succès
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleResendLink}
              disabled={resending}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Renvoyer le lien
                </>
              )}
            </button>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
              Vous avez déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => onNavigate('company-login')}
                className="text-[#E8650A] hover:underline font-medium"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
