import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  UserPlus,
  Trash2,
  Mail,
  X,
  Send,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface CompanyMembersProps {
  onNavigate: (page: 'company-dashboard' | 'contact', filter?: string, contactData?: { subject?: string }) => void;
}

interface Company {
  id: string;
  name: string;
  status: string;
  max_members: number;
  invitation_code: string;
}

interface Member {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: string;
  invited_at: string;
}

export default function CompanyMembers({ onNavigate }: CompanyMembersProps) {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);
  const [inviteProfile, setInviteProfile] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        onNavigate('company-dashboard');
        return;
      }

      const { data: memberData } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .eq('status', 'active')
        .single();

      if (!memberData || !memberData.company_id) {
        onNavigate('company-dashboard');
        return;
      }

      setCompanyId(memberData.company_id);

      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', memberData.company_id)
        .single();

      if (!companyData) {
        onNavigate('company-dashboard');
        return;
      }

      setCompany(companyData as Company);

      const { data: membersData } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', memberData.company_id)
        .order('status', { ascending: true })
        .order('invited_at', { ascending: false });

      setMembers(membersData || []);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInvitationLink('');
    setLinkCopied(false);
    setEmailSent(false);
    setEmailFailed(false);
    setInviteLoading(true);

    try {
      // 1. Récupérer la session courante
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setInviteError('Vous devez être connecté.');
        setInviteLoading(false);
        return;
      }

      // 2. Récupérer le company_id de l'admin
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (memberError || !memberData) {
        setInviteError('Entreprise introuvable : ' + (memberError?.message || 'Aucune entreprise associée'));
        setInviteLoading(false);
        return;
      }

      // Validation de l'email
      if (!inviteEmail || !inviteEmail.includes('@')) {
        setInviteError('Veuillez entrer une adresse email valide');
        setInviteLoading(false);
        return;
      }

      // Validation du profil
      if (!inviteProfile) {
        setInviteError('Veuillez sélectionner un profil de diagnostic');
        setInviteLoading(false);
        return;
      }

      if (!company) {
        setInviteError('Impossible de charger les informations de l\'entreprise');
        setInviteLoading(false);
        return;
      }

      // Vérifier la limite de membres
      const activeMembers = members.filter(m => m.status === 'active');
      if (activeMembers.length >= company.max_members && company.status === 'free') {
        setInviteError(`Vous avez atteint la limite de ${company.max_members} membres du plan gratuit`);
        setInviteLoading(false);
        return;
      }

      // Vérifier si le membre existe déjà
      const existingMember = members.find(m => m.email.toLowerCase() === inviteEmail.toLowerCase());
      if (existingMember) {
        setInviteError('Cette personne fait déjà partie de votre entreprise');
        setInviteLoading(false);
        return;
      }

      // 3. Insérer le nouveau membre
      const { error: insertError } = await supabase
        .from('company_members')
        .insert({
          company_id: memberData.company_id,
          email: inviteEmail.toLowerCase(),
          role: 'member',
          status: 'pending',
          diagnostic_profile: inviteProfile
        });

      if (insertError) {
        setInviteError('Erreur insertion : ' + insertError.message);
        setInviteLoading(false);
        return;
      }

      // 4. Générer le lien d'invitation
      const emailToInvite = inviteEmail.toLowerCase();
      const link = `https://securicoach-cybersec-l5z7.bolt.host/entreprise/rejoindre/${company.invitation_code}?email=${encodeURIComponent(emailToInvite)}`;
      setInvitationLink(link);

      // 5. Envoyer l'email d'invitation via Resend
      try {
        const { error: emailError } = await supabase.functions.invoke('send-company-invitation', {
          body: {
            to: emailToInvite,
            companyName: company.name,
            invitationLink: link
          }
        });

        if (emailError) {
          console.error('Erreur envoi email:', emailError);
          setEmailFailed(true);
        } else {
          console.log('Email d\'invitation envoyé avec succès');
          setEmailSent(true);
        }
      } catch (emailError) {
        console.error('Erreur envoi email:', emailError);
        setEmailFailed(true);
      }

      // 6. Succès
      setInviteSuccess(true);
      setInviteEmail(emailToInvite);

      loadData();

    } catch (err: any) {
      console.error('Erreur invitation:', err);
      setInviteError('Erreur inattendue : ' + (err?.message || 'Erreur inconnue'));
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleResendInvitation = async (member: Member) => {
    try {
      if (!company) return;

      const invitationLink = `https://securicoach-cybersec-l5z7.bolt.host/entreprise/rejoindre/${company.invitation_code}?email=${encodeURIComponent(member.email)}`;

      await supabase.functions.invoke('send-company-invitation', {
        body: {
          to: member.email,
          companyName: company.name,
          invitationLink: invitationLink
        }
      });

      alert('Invitation renvoyée avec succès');
    } catch (error) {
      console.error('Erreur renvoi invitation:', error);
      alert('Erreur lors du renvoi de l\'invitation');
    }
  };

  const handleDelete = async (member: Member) => {
    if (member.role === 'admin') {
      alert('Vous ne pouvez pas supprimer un administrateur');
      return;
    }

    setDeleteConfirm(member.id);
  };

  const confirmDelete = async (memberId: string) => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression du membre');
    } finally {
      setDeleteLoading(false);
    }
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

  const activeMembers = members.filter(m => m.status === 'active');
  const isLimitReached = activeMembers.length >= (company?.max_members || 5) && company?.status === 'free';

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('company-dashboard')}
              className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour au tableau de bord</span>
            </button>
            <button
              onClick={() => setShowInvitePanel(true)}
              disabled={isLimitReached}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Inviter un collaborateur</span>
            </button>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Gestion des membres</h1>
            <p className="text-slate-600 mt-1">
              {activeMembers.length} / {company?.max_members} membres actifs
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLimitReached && (
          <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-lg p-5 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-[#E8650A] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-slate-900 font-bold mb-1">Limite atteinte — passez au Premium pour inviter davantage de collaborateurs</p>
              <p className="text-slate-700 text-sm mb-3">
                Vous avez atteint la limite de {company?.max_members} membres du plan gratuit.
              </p>
              <button
                onClick={() => {
                  onNavigate('contact', undefined, { subject: 'Demande de passage au plan Premium — 19€/mois' });
                }}
                className="px-5 py-2 bg-[#E8650A] text-white rounded-lg hover:bg-[#d15809] transition-all font-semibold text-sm"
              >
                Passer au Premium — Nous contacter
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                    Date d'invitation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {member.first_name?.[0] || member.email[0].toUpperCase()}
                            {member.last_name?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {member.first_name && member.last_name
                              ? `${member.first_name} ${member.last_name}`
                              : member.email}
                          </p>
                          <p className="text-sm text-slate-500 md:hidden">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                      {member.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {member.role === 'admin' ? 'Admin' : 'Membre'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {member.status === 'active' ? 'Actif' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden lg:table-cell">
                      {new Date(member.invited_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {member.status === 'pending' && (
                          <button
                            onClick={() => handleResendInvitation(member)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Renvoyer l'invitation"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        {member.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(member)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showInvitePanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Inviter un collaborateur</h2>
              <button
                onClick={() => {
                  setShowInvitePanel(false);
                  setInviteError('');
                  setInviteEmail('');
                  setInviteProfile('');
                }}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Profil du diagnostic <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="invite-profile"
                      value="equipe"
                      checked={inviteProfile === 'equipe'}
                      onChange={(e) => setInviteProfile(e.target.value)}
                      className="w-4 h-4 text-primary accent-primary"
                      required
                    />
                    <span className="text-sm font-medium text-slate-900">Je travaille au sein d'une entreprise</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="invite-profile"
                      value="boutique"
                      checked={inviteProfile === 'boutique'}
                      onChange={(e) => setInviteProfile(e.target.value)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm font-medium text-slate-900">Je travaille dans un commerce ou point de vente</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="invite-profile"
                      value="solo"
                      checked={inviteProfile === 'solo'}
                      onChange={(e) => setInviteProfile(e.target.value)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm font-medium text-slate-900">Je travaille seul ou en petit cabinet</span>
                  </label>
                </div>
              </div>

              {inviteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{inviteError}</p>
                </div>
              )}

              {inviteSuccess && emailSent && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-700 font-semibold">
                    Invitation envoyée par email à {inviteEmail}
                  </p>
                </div>
              )}

              {inviteSuccess && emailFailed && invitationLink && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-700 mb-3 font-semibold">
                    L'email n'a pas pu être envoyé automatiquement
                  </p>
                  <p className="text-sm text-slate-700 mb-3">
                    Envoyez ce lien à votre collaborateur par email ou messagerie. Il lui permettra de créer son compte et de rejoindre votre espace entreprise.
                  </p>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#F3F4F6] rounded text-xs">
                      <a
                        href={invitationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#374151] hover:underline break-all"
                      >
                        {invitationLink}
                      </a>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#E8650A] text-white rounded-lg hover:bg-[#d15809] transition-colors text-sm font-medium"
                    >
                      {linkCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Lien copié !
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copier le lien
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {inviteSuccess ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvitePanel(false);
                      setInviteError('');
                      setInviteEmail('');
                      setInviteProfile('');
                      setInviteSuccess(false);
                      setInvitationLink('');
                      setLinkCopied(false);
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Fermer
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInvitePanel(false);
                        setInviteError('');
                        setInviteEmail('');
                        setInviteProfile('');
                      }}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {inviteLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Envoyer
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Confirmer la suppression</h2>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir retirer{' '}
              <span className="font-semibold">
                {members.find(m => m.id === deleteConfirm)?.first_name}{' '}
                {members.find(m => m.id === deleteConfirm)?.last_name || members.find(m => m.id === deleteConfirm)?.email}
              </span>{' '}
              de votre espace entreprise ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
