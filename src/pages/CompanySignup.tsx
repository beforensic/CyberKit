import { useState } from 'react';
import { Building2, Users, Briefcase, ArrowRight, ArrowLeft, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CompanySignupProps {
  onNavigate: (page: string) => void;
}

export default function CompanySignup({ onNavigate }: CompanySignupProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [companyData, setCompanyData] = useState({
    name: '',
    sector: '',
    employeeCount: ''
  });

  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const sectors = [
    'Commerce',
    'Profession libérale',
    'Services',
    'Industrie',
    'Autre'
  ];

  const employeeCounts = [
    '1-5',
    '6-10',
    '11-25',
    '26-50',
    '50+'
  ];

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '' };
    if (password.length < 8) return { strength: 1, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 12) return { strength: 2, label: 'Moyen', color: 'bg-orange-500' };

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (strength >= 3 && password.length >= 12) {
      return { strength: 4, label: 'Fort', color: 'bg-green-500' };
    }
    return { strength: 3, label: 'Moyen', color: 'bg-orange-500' };
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyData.name || !companyData.sector || !companyData.employeeCount) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminData.firstName || !adminData.lastName || !adminData.email || !adminData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (adminData.password.length < 12) {
      setError('Le mot de passe doit contenir au moins 12 caractères');
      return;
    }

    if (adminData.password !== adminData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!adminData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: {
            first_name: adminData.firstName,
            last_name: adminData.lastName
          }
        }
      });

      if (authError) {
        console.error('Erreur auth:', authError);
        throw authError;
      }
      if (!authData.user) {
        console.error('Pas de user retourné');
        throw new Error('Erreur lors de la création du compte');
      }

      console.log('Utilisateur créé:', authData.user.id);

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          admin_email: adminData.email,
          admin_user_id: authData.user.id,
          status: 'free',
          max_members: 5,
          sector: companyData.sector,
          employee_count: companyData.employeeCount,
          is_active: true
        })
        .select()
        .single();

      if (companyError) {
        console.error('Erreur company:', companyError);
        throw companyError;
      }

      console.log('Entreprise créée:', company.id);

      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: authData.user.id,
          email: adminData.email,
          first_name: adminData.firstName,
          last_name: adminData.lastName,
          role: 'admin',
          status: 'active',
          activated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (memberError) {
        console.error('Erreur member:', memberError);
        throw memberError;
      }

      console.log('Membre créé:', memberData.id);

      setSuccess(true);
      setTimeout(() => {
        onNavigate('company-dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setError(err.message || 'Une erreur est survenue lors de la création de votre compte');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(adminData.password);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 pb-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Espace entreprise créé avec succès !
          </h2>
          <p className="text-slate-600 mb-2">
            Vous pouvez maintenant inviter jusqu'à 3 collaborateurs gratuitement.
          </p>
          <p className="text-sm text-slate-500">
            Redirection en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 pb-20">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Créer votre espace entreprise
          </h1>
          <p className="text-slate-600">
            Gérez la cybersécurité de votre équipe en toute simplicité
          </p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#E8650A] text-white' : 'bg-slate-200 text-slate-500'}`}>
              1
            </div>
            <div className={`w-24 h-1 mx-2 ${step >= 2 ? 'bg-[#E8650A]' : 'bg-slate-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#E8650A] text-white' : 'bg-slate-200 text-slate-500'}`}>
              2
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 ? (
            <form onSubmit={handleStep1Next}>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Informations entreprise
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E8650A] focus:border-transparent"
                      placeholder="Nom de votre entreprise"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Secteur d'activité *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={companyData.sector}
                      onChange={(e) => setCompanyData({ ...companyData, sector: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E8650A] focus:border-transparent appearance-none"
                      required
                    >
                      <option value="">Sélectionnez un secteur</option>
                      {sectors.map((sector) => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre d'employés *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={companyData.employeeCount}
                      onChange={(e) => setCompanyData({ ...companyData, employeeCount: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E8650A] focus:border-transparent appearance-none"
                      required
                    >
                      <option value="">Sélectionnez une tranche</option>
                      {employeeCounts.map((count) => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-8 bg-[#E8650A] text-white py-3 rounded-lg font-semibold hover:bg-[#d15809] transition-all flex items-center justify-center gap-2"
              >
                Suivant
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour
                </button>
                <h2 className="text-2xl font-bold text-slate-900">
                  Compte administrateur
                </h2>
                <div className="w-20"></div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Prénom *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={adminData.firstName}
                        onChange={(e) => setAdminData({ ...adminData, firstName: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E8650A] focus:border-transparent"
                        placeholder="Prénom"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={adminData.lastName}
                      onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E8650A] focus:border-transparent"
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email professionnel *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E8650A] focus:border-transparent"
                      placeholder="votre@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mot de passe * (min. 12 caractères)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E8650A] focus:border-transparent"
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  {adminData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Force du mot de passe</span>
                        <span className={`text-xs font-medium ${passwordStrength.strength >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={adminData.confirmPassword}
                      onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E8650A] focus:border-transparent"
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={adminData.acceptTerms}
                    onChange={(e) => setAdminData({ ...adminData, acceptTerms: e.target.checked })}
                    className="mt-1 w-4 h-4 text-[#E8650A] border-slate-300 rounded focus:ring-[#E8650A]"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600">
                    J'accepte les{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('legal')}
                      className="text-[#E8650A] hover:underline"
                    >
                      conditions d'utilisation
                    </button>
                    {' '}et la{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('legal')}
                      className="text-[#E8650A] hover:underline"
                    >
                      politique de confidentialité
                    </button>
                  </label>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-[#E8650A] text-white py-3 rounded-lg font-semibold hover:bg-[#d15809] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création en cours...' : 'Créer mon espace entreprise'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-600">
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
