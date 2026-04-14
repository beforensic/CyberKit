import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import {
  ArrowLeft,
  Users,
  ClipboardCheck,
  TrendingUp,
  Clock,
  Copy,
  Check,
  UserPlus,
  LogOut,
  Settings,
  FileText,
  AlertCircle,
  Settings2
} from 'lucide-react';

const QUIZ_QUESTIONS: Record<string, Array<{ id: string; label: string }>> = {
  "J'ai une boutique ou un point de vente": [
    { id: "c1", label: "Votre Wi-Fi client est-il isolé du réseau de votre caisse ?" },
    { id: "c2", label: "Le code d'accès de votre TPE/Caisse est-il personnalisé ?" },
    { id: "c3", label: "Vérifiez-vous par téléphone tout changement de numéro de compte (IBAN) reçu par email ou par message ?" },
    { id: "c4", label: "Les clés USB personnelles sont-elles interdites sur vos outils pro ?" },
    { id: "c5", label: "Votre site e-commerce affiche-t-il bien le cadenas (HTTPS) ?" },
    { id: "c6", label: "En cas de panne technique (coupure électrique, terminal de paiement déconnecté, caisse inaccessible), avez-vous une procédure définie pour continuer à servir vos clients ?" },
    { id: "c7", label: "Avez-vous changé le mot de passe admin de vos caméras de surveillance ?" },
    { id: "c8", label: "Vos fichiers clients sont-ils protégés par mot de passe ?" },
    { id: "c9", label: "Détruisez-vous vos documents papier contenant des données clients ?" },
    { id: "c10", label: "Avez-vous plusieurs administrateurs sur vos pages sociales pros ?" }
  ],
  "Je travaille seul ou en petit cabinet": [
    { id: "l1", label: "Les données sur votre disque dur sont-elles chiffrées ?" },
    { id: "l2", label: "Utilisez-vous une messagerie sécurisée (ex: Signal/Proton) ?" },
    { id: "l3", label: "Votre ordinateur pro a-t-il une session différente de votre famille ?" },
    { id: "l4", label: "Tenez-vous un registre RGPD de vos données clients ?" },
    { id: "l5", label: "Pouvez-vous effacer vos données à distance en cas de vol ?" },
    { id: "l6", label: "Vos sauvegardes sont-elles débranchées après utilisation ?" },
    { id: "l7", label: "Utilisez-vous un VPN lors de vos déplacements ?" },
    { id: "l8", label: "Avez-vous changé le mot de passe Wi-Fi par défaut de votre box ?" },
    { id: "l9", label: "Ignorez-vous les appels de 'support technique' non sollicités ?" },
    { id: "l10", label: "Vos contrats incluent-ils une clause de confidentialité numérique ?" }
  ],
  "Je dirige une équipe": [
    { id: "e1", label: "Appliquez-vous la règle de sauvegarde 3-2-1 ?" },
    { id: "e2", label: "Chaque employé possède-t-il sa propre session individuelle ?" },
    { id: "e3", label: "Utilisez-vous un gestionnaire de mots de passe d'équipe ?" },
    { id: "e4", label: "Formez-vous vos équipes au phishing (simulations) ?" },
    { id: "e5", label: "Avez-vous un process pour couper les accès d'un salarié sortant ?" },
    { id: "e6", label: "Avez-vous un Plan de Reprise d'Activité (PRA) écrit ?" },
    { id: "e7", label: "Votre parc est-il protégé par un antivirus centralisé (EDR) ?" },
    { id: "e8", label: "Votre Wi-Fi d'entreprise est-il sécurisé en WPA3 ?" },
    { id: "e9", label: "Le chiffrement des disques est-il obligatoire sur vos portables ?" },
    { id: "e10", label: "Avez-vous une assurance spécifique contre les cyber-risques ?" }
  ]
};

interface CompanyDashboardProps {
  onNavigate: (page: 'home' | 'company-login' | 'company-members' | 'company-plans' | 'contact', filter?: string, contactData?: { subject?: string }) => void;
}

interface Company {
  id: string;
  name: string;
  status: string;
  max_members: number;
  invitation_code: string;
  diagnostic_profile: string | null;
}

interface Member {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: string;
  created_at: string;
}

interface Diagnostic {
  member_id: string;
  score: number;
  risk_level: string;
  profile: string;
  completed_at: string;
  answers?: Record<string, 'yes' | 'no' | 'unknown'>;
}

interface CurrentUser {
  first_name: string;
  last_name: string;
}

export default function CompanyDashboard({ onNavigate }: CompanyDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [copied, setCopied] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPdfTooltip, setShowPdfTooltip] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();

    const params = new URLSearchParams(window.location.search);
    if (params.get('upgrade') === 'success') {
      setUpgradeMessage(true);
      window.history.replaceState({}, '', '/entreprise/dashboard');
    }
  }, []);

  useEffect(() => {
    if (company?.diagnostic_profile) {
      setSelectedProfile(company.diagnostic_profile);
    }
  }, [company]);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        onNavigate('company-login');
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('*, companies(*)')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .eq('status', 'active')
        .single();

      if (memberError || !memberData) {
        onNavigate('company-login');
        return;
      }

      setCurrentUser({
        first_name: memberData.first_name || '',
        last_name: memberData.last_name || ''
      });

      setCompany(memberData.companies as unknown as Company);

      const { data: membersData } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', memberData.companies.id)
        .order('status', { ascending: true })
        .order('created_at', { ascending: false });

      setMembers(membersData || []);

      const { data: diagnosticsData } = await supabase
        .from('company_diagnostics')
        .select('*')
        .eq('company_id', memberData.companies.id);

      setDiagnostics(diagnosticsData || []);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      onNavigate('company-login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('home');
  };

  const handleCopyInvitationLink = () => {
    const link = `https://securicoach-cybersec-l5z7.bolt.host/entreprise/rejoindre/${company?.invitation_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpgradeClick = () => {
    onNavigate('contact', undefined, { subject: 'Demande de passage au plan Premium — 19€/mois' });
  };

  const handleSaveDiagnosticProfile = async () => {
    if (!company) return;

    setProfileSaving(true);
    setProfileSaved(false);

    try {
      const { error } = await supabase
        .from('companies')
        .update({ diagnostic_profile: selectedProfile || null })
        .eq('id', company.id);

      if (error) throw error;

      setCompany({ ...company, diagnostic_profile: selectedProfile || null });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      alert('Erreur lors de la sauvegarde du profil diagnostic');
    } finally {
      setProfileSaving(false);
    }
  };

  const generateTeamPDF = () => {
    if (company?.status !== 'paid') return;

    setPdfLoading(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('SecuriCoach — Rapport équipe', pageWidth / 2, yPos, { align: 'center' });

      yPos += 10;
      doc.setFontSize(16);
      doc.text(company.name, pageWidth / 2, yPos, { align: 'center' });

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const today = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Date de génération : ${today}`, pageWidth / 2, yPos, { align: 'center' });

      yPos += 15;
      doc.setDrawColor(232, 101, 10);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);

      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const introText = "Ce rapport présente l'état de la sensibilisation à la cybersécurité au sein de votre équipe, basé sur les diagnostics réalisés sur SecuriCoach. Il vous permet d'identifier les priorités collectives et d'orienter vos actions de sensibilisation.";
      const splitIntro = doc.splitTextToSize(introText, pageWidth - 40);
      splitIntro.forEach((line: string) => {
        doc.text(line, 20, yPos);
        yPos += 5;
      });

      doc.setTextColor(0, 0, 0);
      yPos += 7;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Résumé', 20, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const summaryData = [
        `Nombre de membres actifs : ${activeMembers.length}`,
        `Diagnostics complétés : ${completedDiagnostics.length} / ${activeMembers.length}`,
        `Score moyen de l'équipe : ${averageScore !== null ? `${averageScore}/100` : 'Non disponible'}`,
        `Niveau de risque moyen : ${getAverageRiskLevel()}`
      ];

      summaryData.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });

      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Détail par membre', 20, yPos);

      yPos += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');

      const tableHeaders = ['Nom', 'Email', 'Score', 'Risque', 'Date'];
      const colWidths = [35, 55, 20, 35, 35];
      let xPos = 20;

      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos, yPos);
        xPos += colWidths[i];
      });

      yPos += 6;
      doc.setLineWidth(0.1);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');

      members.forEach(member => {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }

        const diagnostic = getMemberDiagnostic(member.id);
        const memberName = member.first_name && member.last_name
          ? `${member.first_name} ${member.last_name}`
          : member.email.split('@')[0];

        const memberEmail = member.email.length > 25
          ? member.email.substring(0, 22) + '...'
          : member.email;

        const score = diagnostic ? `${diagnostic.score}/100` : 'Non complété';
        const risk = diagnostic ? diagnostic.risk_level : '—';
        const date = diagnostic
          ? new Date(diagnostic.completed_at).toLocaleDateString('fr-FR')
          : '—';

        xPos = 20;
        const rowData = [memberName, memberEmail, score, risk, date];

        rowData.forEach((text, i) => {
          doc.text(text, xPos, yPos);
          xPos += colWidths[i];
        });

        yPos += 6;

        if (diagnostic && diagnostic.profile) {
          doc.setFontSize(8);
          doc.setTextColor(60, 60, 60);
          doc.text(`Profil : ${diagnostic.profile}`, 25, yPos);
          yPos += 4;
          doc.setTextColor(0, 0, 0);
        }

        if (diagnostic && diagnostic.answers) {
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);

          const questions = QUIZ_QUESTIONS[diagnostic.profile];
          if (questions) {
            const priorities: string[] = [];
            questions.forEach(q => {
              const answer = diagnostic.answers?.[q.id];
              if (answer === 'no' || answer === 'unknown') {
                priorities.push(q.label);
              }
            });

            if (priorities.length > 0) {
              const top3 = priorities.slice(0, 3);
              doc.text('Priorités :', 25, yPos);
              yPos += 4;

              top3.forEach((priority, index) => {
                if (yPos > pageHeight - 20) {
                  doc.addPage();
                  yPos = 20;
                }
                const priorityText = `${index + 1}. ${priority}`;
                const wrappedText = doc.splitTextToSize(priorityText, pageWidth - 55);
                wrappedText.forEach((line: string) => {
                  doc.text(line, 30, yPos);
                  yPos += 3.5;
                });
              });
            } else {
              doc.text('Priorités : Aucune priorité identifiée', 25, yPos);
              yPos += 4;
            }
          } else {
            doc.text('Priorités : —', 25, yPos);
            yPos += 4;
          }

          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
        }

        yPos += 2;
      });

      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommandations', 20, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      let recommendation = '';
      let resources: string[] = [];

      if (averageScore === null) {
        recommendation = 'Aucun diagnostic complété. Invitez vos collaborateurs à passer le diagnostic.';
      } else if (averageScore < 40) {
        recommendation = 'Niveau de risque élevé — une sensibilisation urgente est recommandée. Nous vous conseillons de commencer par ces ressources SecuriCoach :';
        resources = [
          '1. Les règles d\'or du mot de passe',
          '2. La double authentification expliquée à un utilisateur final',
          '3. Phishing et dérivés : Guide complet de prévention et de protection'
        ];
      } else if (averageScore < 70) {
        recommendation = 'Votre équipe progresse mais des axes d\'amélioration subsistent. Ressources conseillées :';
        resources = [
          '1. La politique de sauvegarde 3-2-1',
          '2. Comprendre la fraude au président',
          '3. Protéger les données de votre clé USB'
        ];
      } else {
        recommendation = 'Bonne maîtrise globale — maintenez les efforts. Pour aller encore plus loin :';
        resources = [
          '1. Roadmap : Analyse de risques',
          '2. Sécuriser votre Facebook Pro en 30 minutes',
          '3. Gestion de crise en cas de cyberattaque'
        ];
      }

      const splitText = doc.splitTextToSize(recommendation, pageWidth - 40);
      splitText.forEach((line: string) => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 5;
      });

      if (resources.length > 0) {
        yPos += 3;
        resources.forEach(resource => {
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(resource, 25, yPos);
          yPos += 5;
        });

        yPos += 5;
        doc.setTextColor(60, 60, 60);
        doc.text('Contactez beForensic pour un accompagnement personnalisé : info@beforensic.be', 20, yPos);
        doc.setTextColor(0, 0, 0);
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Rapport généré par SecuriCoach — beForensic', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text('www.securicoach.be | info@beforensic.be', pageWidth / 2, pageHeight - 15, { align: 'center' });
      doc.text(`Ce rapport est confidentiel et destiné à l'usage exclusif de ${company.name}.`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      const fileName = `SecuriCoach-Rapport-${company.name.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du rapport PDF.');
    } finally {
      setPdfLoading(false);
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

  if (!company) {
    return null;
  }

  const activeMembers = members.filter(m => m.status === 'active');
  const completedDiagnostics = diagnostics.filter(d => d.score !== null);
  const averageScore = completedDiagnostics.length > 0
    ? Math.round(completedDiagnostics.reduce((sum, d) => sum + d.score, 0) / completedDiagnostics.length)
    : null;

  const getAverageRiskLevel = () => {
    if (!averageScore) return '—';
    if (averageScore < 40) return 'Risque élevé';
    if (averageScore < 70) return 'En progression';
    return 'Bien protégé';
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return 'text-red-600 bg-red-50';
    if (score < 70) return 'text-orange-600 bg-orange-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getLastActivity = () => {
    if (completedDiagnostics.length === 0) return '—';
    const latest = completedDiagnostics.sort((a, b) =>
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    )[0];
    return new Date(latest.completed_at).toLocaleDateString('fr-FR');
  };

  const getMemberDiagnostic = (memberId: string) => {
    return diagnostics.find(d => d.member_id === memberId);
  };

  const isLimitReached = activeMembers.length >= company.max_members && company.status === 'free';

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

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                Tableau de bord — {company.name}
              </h1>
              <p className="text-slate-600">
                Bienvenue, {currentUser?.first_name} {currentUser?.last_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={company.status === 'paid' ? generateTeamPDF : undefined}
                  onMouseEnter={() => setShowPdfTooltip(true)}
                  onMouseLeave={() => setShowPdfTooltip(false)}
                  disabled={company.status !== 'paid' || pdfLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    company.status === 'paid'
                      ? 'bg-[#E8650A] text-white hover:bg-[#d15809]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="hidden lg:inline">
                    {pdfLoading ? 'Génération...' : 'Exporter le rapport équipe'}
                  </span>
                </button>
                {showPdfTooltip && (
                  <div className="absolute top-full mt-2 right-0 z-20 w-auto whitespace-nowrap bg-slate-900 text-white text-sm rounded-lg px-3 py-2 shadow-xl">
                    {company.status === 'paid'
                      ? 'Exporter le rapport de l\'équipe en PDF'
                      : (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <p>Fonctionnalité réservée au plan Premium</p>
                        </div>
                      )
                    }
                  </div>
                )}
              </div>
              <button
                onClick={() => onNavigate('company-members')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Gérer les membres</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {upgradeMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <div className="text-2xl">🎉</div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Bienvenue dans le plan Premium !</h3>
              <p className="text-sm text-green-700">
                Votre espace entreprise est maintenant déverrouillé avec des collaborateurs illimités.
              </p>
            </div>
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Statistiques générales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                {isLimitReached && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                    Limite atteinte
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Membres</h3>
              <p className="text-3xl font-bold text-slate-900 mb-3">
                {company.max_members > 10
                  ? `${activeMembers.length} membres`
                  : `${activeMembers.length} / ${company.max_members}`}
              </p>
              {company.max_members > 10 ? (
                <p className="text-sm text-slate-500 font-medium">(illimité)</p>
              ) : (
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-[#E8650A] rounded-full h-2 transition-all"
                    style={{ width: `${(activeMembers.length / company.max_members) * 100}%` }}
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="p-3 bg-emerald-100 rounded-lg mb-4 w-fit">
                <ClipboardCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Diagnostics complétés</h3>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {completedDiagnostics.length} / {activeMembers.length}
              </p>
              <p className="text-sm text-slate-500">
                {activeMembers.length > 0
                  ? `${Math.round((completedDiagnostics.length / activeMembers.length) * 100)}% de complétion`
                  : 'Aucun membre actif'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="p-3 bg-purple-100 rounded-lg mb-4 w-fit">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Score moyen de l'équipe</h3>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {averageScore !== null ? `${averageScore}/100` : '—'}
              </p>
              <p className={`text-sm font-medium ${averageScore !== null ? getRiskColor(averageScore).split(' ')[0] : 'text-slate-500'}`}>
                {getAverageRiskLevel()}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="p-3 bg-orange-100 rounded-lg mb-4 w-fit">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Dernière activité</h3>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {getLastActivity()}
              </p>
              <p className="text-sm text-slate-500">
                Dernier diagnostic
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Membres et diagnostics</h2>
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
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Diagnostic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden xl:table-cell">
                      Niveau de risque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden xl:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {members.map((member) => {
                    const diagnostic = getMemberDiagnostic(member.id);
                    return (
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
                            member.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {member.status === 'active' ? 'Actif' : 'En attente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            diagnostic
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {diagnostic ? 'Complété' : 'Non complété'}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-sm font-semibold text-slate-900">
                            {diagnostic ? `${diagnostic.score}/100` : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden xl:table-cell">
                          {diagnostic ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(diagnostic.score)}`}>
                              {diagnostic.risk_level}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 hidden xl:table-cell">
                          {diagnostic
                            ? new Date(diagnostic.completed_at).toLocaleDateString('fr-FR')
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Paramètres du diagnostic équipe</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Settings2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Profil du diagnostic</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Choisissez le profil qui sera automatiquement appliqué à tous vos collaborateurs lors du diagnostic.
                </p>

                <div className="space-y-3 mb-4">
                  <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="diagnostic-profile"
                      value="boutique"
                      checked={selectedProfile === 'boutique'}
                      onChange={(e) => setSelectedProfile(e.target.value)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm font-medium text-slate-900">J'ai une boutique ou un point de vente</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="diagnostic-profile"
                      value="solo"
                      checked={selectedProfile === 'solo'}
                      onChange={(e) => setSelectedProfile(e.target.value)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm font-medium text-slate-900">Je travaille seul ou en petit cabinet</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="diagnostic-profile"
                      value="equipe"
                      checked={selectedProfile === 'equipe'}
                      onChange={(e) => setSelectedProfile(e.target.value)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm font-medium text-slate-900">Je dirige une équipe</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="diagnostic-profile"
                      value=""
                      checked={selectedProfile === ''}
                      onChange={(e) => setSelectedProfile(e.target.value)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm font-medium text-slate-500 italic">Aucun profil (choix libre)</span>
                  </label>
                </div>

                {!company?.diagnostic_profile && selectedProfile === '' && (
                  <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-600">
                      Aucun profil défini — vos collaborateurs pourront choisir librement leur profil.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveDiagnosticProfile}
                    disabled={profileSaving}
                    className="px-6 py-2 bg-[#E8650A] text-white rounded-lg hover:bg-[#d15809] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>

                  {profileSaved && (
                    <span className="flex items-center gap-2 text-emerald-600 font-medium">
                      <Check className="w-5 h-5" />
                      Profil enregistré ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Ressources les plus consultées</h2>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600">
                Les statistiques de consultation seront disponibles prochainement.
              </p>
            </div>
          </div>
        </section>

        {company.status === 'free' && (
          <section>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#E8650A] rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2">
                    Vous utilisez le plan gratuit (3 collaborateurs max)
                  </h3>
                  <p className="text-slate-700 mb-4">
                    Passez au Premium pour des collaborateurs illimités, l'export PDF équipe et le support prioritaire.
                  </p>
                  <button
                    onClick={handleUpgradeClick}
                    className="px-6 py-3 bg-[#E8650A] text-white rounded-lg hover:bg-[#d15809] transition-all font-semibold"
                  >
                    Passer au Premium — 19€/mois
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Inviter des collaborateurs</h2>
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-primary rounded-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Partagez ce lien avec vos collaborateurs
                </h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    readOnly
                    value={`https://securicoach-cybersec-l5z7.bolt.host/entreprise/rejoindre/${company.invitation_code}`}
                    className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 font-mono"
                  />
                  <button
                    onClick={handleCopyInvitationLink}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                {isLimitReached && (
                  <div className="bg-white border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-slate-700 mb-3">
                      Vous avez atteint la limite de {company.max_members} collaborateurs du plan gratuit.
                      Passez au plan Premium pour inviter davantage.
                    </p>
                    <button
                      onClick={handleUpgradeClick}
                      className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-primary to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      Passer au Premium — 19€/mois
                    </button>
                  </div>
                )}

                {!isLimitReached && (
                  <p className="text-sm text-slate-600">
                    {company.max_members > 10
                      ? `${activeMembers.length} membres (illimité)`
                      : `${activeMembers.length} / ${company.max_members} places utilisées`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {company.status === 'paid' && (
          <section>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎯</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Support prioritaire</h3>
                  <p className="text-slate-700 mb-3">
                    En tant que membre Premium, bénéficiez d'une réponse sous 24h à vos questions.
                  </p>
                  <a
                    href="mailto:premium@beforensic.be"
                    className="inline-flex items-center gap-2 text-[#E8650A] hover:text-[#d15809] font-semibold transition-colors"
                  >
                    <span>📧</span>
                    <span>premium@beforensic.be</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
