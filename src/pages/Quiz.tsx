import { useState, useEffect, useRef } from 'react';
import { Store, Briefcase, Building2, ArrowRight, RefreshCw, CheckCircle, XCircle, AlertCircle, BookOpen, Award, TrendingUp, FileDown, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import AIAnalysis from '../components/AIAnalysis';
import GoogleReview from '../components/GoogleReview';
import ResourceCard from '../components/ResourceCard';
import { supabase, Resource } from '../lib/supabase';
import { generatePDF } from '../utils/pdfExport';

type ProfileType = 'commercant' | 'liberal' | 'pme';
type AnswerType = 'yes' | 'no' | 'unknown';

interface Question {
  id: string;
  label: string;
  correctAnswer: boolean;
  recommendation: string;
}

interface Profile {
  title: string;
  icon: React.ElementType; // Changé de string à React.ElementType
  questions: Question[];
}

const CYBER_QUIZ_DATA: Record<ProfileType, Profile> = {
  commercant: {
    title: "Boutique ou Point de vente",
    icon: Store,
    questions: [
      { id: "c1", label: "Votre Wi-Fi client est-il isolé du réseau de votre caisse ?", correctAnswer: true, recommendation: "Séparez les réseaux. Un client ne doit jamais pouvoir accéder à votre système de gestion de stock." },
      { id: "c2", label: "Le code d'accès de votre TPE/Caisse est-il personnalisé ?", correctAnswer: true, recommendation: "Ne gardez jamais les codes par défaut (0000). Changez-les tous les 6 mois." },
      { id: "c3", label: "Vérifiez-vous par téléphone tout changement d'IBAN reçu par email ?", correctAnswer: true, recommendation: "C'est la parade contre l'arnaque au faux virement. Un appel rapide évite de lourdes pertes financières." },
      { id: "c4", label: "Les clés USB personnelles sont-elles interdites sur vos outils pro ?", correctAnswer: true, recommendation: "Les clés USB sont des vecteurs de virus. Fournissez des clés dédiées à vos employés." },
      { id: "c5", label: "Votre site e-commerce affiche-t-il bien le cadenas (HTTPS) ?", correctAnswer: true, recommendation: "Le HTTPS protège les données bancaires de vos clients et votre référencement Google." },
      { id: "c6", label: "Avez-vous une procédure pour servir vos clients en cas de panne tech ?", correctAnswer: true, recommendation: "Gardez un TPE mobile de secours pour ne pas perdre de ventes en cas d'incident réseau." },
      { id: "c7", label: "Avez-vous changé le mot de passe admin de vos caméras ?", correctAnswer: true, recommendation: "Les caméras avec mots de passe d'origine sont piratables en quelques secondes." },
      { id: "c8", label: "Vos fichiers clients sont-ils protégés par mot de passe ?", correctAnswer: true, recommendation: "Le RGPD vous oblige à sécuriser les données clients. Ne laissez pas ces fichiers en libre accès." },
      { id: "c9", label: "Détruisez-vous vos documents papier contenant des données clients ?", correctAnswer: true, recommendation: "Utilisez un destructeur de documents. Les poubelles sont des mines d'or pour les fraudeurs." },
      { id: "c10", label: "Avez-vous plusieurs administrateurs sur vos pages sociales ?", correctAnswer: true, recommendation: "Si votre compte est bloqué, un deuxième admin pourra sauver votre présence en ligne." }
    ]
  },
  liberal: {
    title: "Indépendant ou Cabinet",
    icon: Briefcase,
    questions: [
      { id: "l1", label: "Les données sur votre disque dur sont-elles chiffrées ?", correctAnswer: true, recommendation: "Activez BitLocker (Win) ou FileVault (Mac) pour protéger vos secrets pro en cas de vol." },
      { id: "l2", label: "Utilisez-vous une messagerie sécurisée (ex: Signal/Proton) ?", correctAnswer: true, recommendation: "Privilégiez le chiffrage de bout en bout pour les documents confidentiels." },
      { id: "l3", label: "Votre ordinateur pro a-t-il une session différente de votre famille ?", correctAnswer: true, recommendation: "Séparez pro et perso pour éviter les suppressions accidentelles ou les malwares." },
      { id: "l4", label: "Tenez-vous un registre RGPD de vos données clients ?", correctAnswer: true, recommendation: "Listez simplement ce que vous collectez et où c'est stocké pour être en conformité." },
      { id: "l5", label: "Pouvez-vous effacer vos données à distance en cas de vol ?", correctAnswer: true, recommendation: "Configurez 'Localiser mon appareil' pour protéger vos secrets pro à distance." },
      { id: "l6", label: "Vos sauvegardes sont-elles débranchées après utilisation ?", correctAnswer: true, recommendation: "Un virus peut infecter votre disque de sauvegarde s'il reste branché au réseau." },
      { id: "l7", label: "Utilisez-vous un VPN lors de vos déplacements ?", correctAnswer: true, recommendation: "Le VPN sécurise vos accès pro sur les réseaux nomades ou publics." },
      { id: "l8", label: "Avez-vous changé le mot de passe Wi-Fi par défaut de votre box ?", correctAnswer: true, recommendation: "Utilisez une phrase de passe complexe pour protéger l'accès à votre cabinet." },
      { id: "l9", label: "Ignorez-vous les appels de 'support technique' non sollicités ?", correctAnswer: true, recommendation: "Microsoft ou votre banque ne vous appelleront jamais pour demander un accès distant." },
      { id: "l10", label: "Vos contrats incluent-ils une clause de confidentialité numérique ?", correctAnswer: true, recommendation: "Protégez-vous juridiquement sur la manière dont vous traitez les données sensibles." }
    ]
  },
  pme: {
    title: "Chef d'entreprise ou Manager",
    icon: Building2,
    questions: [
      { id: "e1", label: "Appliquez-vous la règle de sauvegarde 3-2-1 ?", correctAnswer: true, recommendation: "3 copies, 2 supports, 1 hors-site. C'est l'assurance vie de vos données." },
      { id: "e2", label: "Chaque employé possède-t-il sa propre session individuelle ?", correctAnswer: true, recommendation: "L'imputabilité est clé pour la sécurité et la traçabilité des accès." },
      { id: "e3", label: "Utilisez-vous un gestionnaire de mots de passe d'équipe ?", correctAnswer: true, recommendation: "Évitez les post-it et sécurisez le partage d'accès entre collaborateurs." },
      { id: "e4", label: "Formez-vous vos équipes au phishing (simulations) ?", correctAnswer: true, recommendation: "L'humain est le premier rempart. Testez-les régulièrement pour les sensibiliser." },
      { id: "e5", label: "Avez-vous un process pour couper les accès d'un salarié sortant ?", correctAnswer: true, recommendation: "Désactivez immédiatement les comptes pour éviter toute intrusion post-départ." },
      { id: "e6", label: "Avez-vous un Plan de Reprise d'Activité (PRA) écrit ?", correctAnswer: true, recommendation: "Savoir quoi faire en cas d'attaque divise par deux le temps d'arrêt de l'entreprise." },
      { id: "e7", label: "Votre parc est-il protégé par un antivirus centralisé (EDR) ?", correctAnswer: true, recommendation: "L'EDR détecte les comportements suspects sur l'ensemble de vos postes de travail." },
      { id: "e8", label: "Votre Wi-Fi d'entreprise est-il sécurisé en WPA3 ?", correctAnswer: true, recommendation: "Le WPA3 est le standard actuel pour empêcher les intrusions par le réseau sans fil." },
      { id: "e9", label: "Le chiffrement des disques est-il obligatoire sur vos portables ?", correctAnswer: true, recommendation: "Un PC égaré ne doit pas se transformer en fuite de données majeure pour la société." },
      { id: "e10", label: "Avez-vous une assurance spécifique contre les cyber-risques ?", correctAnswer: true, recommendation: "Elle couvre les frais d'expertise et les pertes d'exploitation après une attaque." }
    ]
  }
};

const PROFILE_CONFIGS: Record<ProfileType, { icon: any, color: string, bgColor: string, description: string }> = {
  commercant: {
    icon: Store,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    description: 'Commerçants, artisans — vous gérez des encaissements'
  },
  liberal: {
    icon: Briefcase,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    description: 'Indépendants — vous gérez des données confidentielles'
  },
  pme: {
    icon: Building2,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    description: 'TPE et PME — vous avez des collaborateurs et un réseau interne'
  }
};

interface QuizProps {
  onNavigate: (page: 'home' | 'quiz' | 'resources' | 'admin' | 'contact' | 'legal', filter?: string) => void;
}

const PROFILE_DISPLAY_NAMES: Record<string, string> = {
  'boutique': 'Commerce ou Point de vente',
  'solo': 'Seul ou en petit cabinet',
  'equipe': 'Au sein d\'une entreprise'
};

export default function Quiz({ onNavigate }: QuizProps) {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [recommendedResources, setRecommendedResources] = useState<Resource[]>([]);
  const analysisRef = useRef<{ getAnalysisText: () => string } | null>(null);
  const [companyDiagnosticProfile, setCompanyDiagnosticProfile] = useState<string | null>(null);
  const [companyProfileLoading, setCompanyProfileLoading] = useState(true);
  const [profileLocked, setProfileLocked] = useState(false);

  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: memberData } = await supabase
            .from('company_members')
            .select('diagnostic_profile, company_id')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .maybeSingle();

          if (memberData?.diagnostic_profile) {
            const profileMapping: Record<string, ProfileType> = {
              'boutique': 'commercant',
              'solo': 'liberal',
              'equipe': 'pme'
            };
            const mappedProfile = profileMapping[memberData.diagnostic_profile];
            setCompanyDiagnosticProfile(memberData.diagnostic_profile);
            if (mappedProfile) {
              setSelectedProfile(mappedProfile);
              setProfileLocked(true);
            }
          }
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
      } finally {
        setCompanyProfileLoading(false);
      }
    };
    loadCompanyProfile();
  }, []);

  useEffect(() => {
    if (isFinished && score === 100) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isFinished, score]);

  const handleProfileSelect = (profile: ProfileType) => {
    if (profileLocked) return;
    setSelectedProfile(profile);
    setCurrentQuestion(0);
    setAnswers({});
    setIsFinished(false);
    setScore(0);
  };

  const handleAnswer = (answerType: AnswerType) => {
    if (!selectedProfile) return;
    const questions = CYBER_QUIZ_DATA[selectedProfile].questions;
    const currentQ = questions[currentQuestion];
    const newAnswers = { ...answers, [currentQ.id]: answerType };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore(newAnswers);
    }
  };

  const fetchRecommendedResources = async (scoreValue: number) => {
    try {
      let searchPatterns: string[] = [];
      if (scoreValue <= 40) searchPatterns = ['%mot de passe%', '%double%authentification%', '%Phishing%'];
      else if (scoreValue <= 70) searchPatterns = ['%sauvegarde%', '%fraude%', '%clé USB%'];
      else searchPatterns = ['%Analyse de risques%', '%Facebook Pro%', '%Gestion de crise%'];

      const resources: Resource[] = [];
      for (const pattern of searchPatterns) {
        const { data } = await supabase.from('resources')
          .select('*, theme:themes(*), resource_type:resource_types(*)')
          .ilike('title', pattern).limit(1).maybeSingle();
        if (data) resources.push(data);
      }
      setRecommendedResources(resources);
    } catch (error) {
      console.error('Error resources:', error);
    }
  };

  const calculateScore = async (finalAnswers: Record<string, AnswerType>) => {
    if (!selectedProfile) return;
    const questions = CYBER_QUIZ_DATA[selectedProfile].questions;
    let totalScore = 0;
    questions.forEach(q => { if (finalAnswers[q.id] === 'yes') totalScore += 10; });

    let riskLevel = totalScore < 50 ? 'Critique' : totalScore < 70 ? 'Progression' : totalScore < 90 ? 'Bon' : 'Expert';
    setScore(totalScore);
    setIsFinished(true);
    fetchRecommendedResources(totalScore);

    localStorage.setItem('cyberkit_score', JSON.stringify({ score: totalScore, date: new Date().toISOString() }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: memberData } = await supabase.from('company_members')
          .select('id, company_id').eq('user_id', session.user.id).maybeSingle();
        if (memberData) {
          await supabase.from('company_diagnostics').insert({
            company_id: memberData.company_id,
            member_id: memberData.id,
            score: totalScore,
            risk_level: riskLevel,
            profile: CYBER_QUIZ_DATA[selectedProfile].title,
            completed_at: new Date().toISOString(),
            answers: finalAnswers
          });
        }
      }
    } catch (error) { console.error('Error saving:', error); }
  };

  const resetQuiz = () => {
    if (!profileLocked) setSelectedProfile(null);
    setAnswers({});
    setCurrentQuestion(0);
    setIsFinished(false);
    setScore(0);
    localStorage.removeItem('cyberkit_score');
  };

  const getPriorityRecommendations = () => {
    if (!selectedProfile) return [];
    return CYBER_QUIZ_DATA[selectedProfile].questions
      .filter(q => answers[q.id] === 'no' || answers[q.id] === 'unknown')
      .slice(0, 3);
  };

  const getAllRecommendations = () => {
    if (!selectedProfile) return [];
    return CYBER_QUIZ_DATA[selectedProfile].questions
      .filter(q => answers[q.id] === 'no' || answers[q.id] === 'unknown');
  };

  const handleExportPDF = () => {
    if (!selectedProfile) return;
    const result = getResultMessage();
    generatePDF({
      score,
      level: result.title,
      profile: CYBER_QUIZ_DATA[selectedProfile].title,
      analysisText: analysisRef.current?.getAnalysisText() || '',
      priorities: getPriorityRecommendations().map(q => ({ question: q, answer: answers[q.id] })),
      resources: recommendedResources,
      allQuestions: CYBER_QUIZ_DATA[selectedProfile].questions.map(q => ({ question: q, answer: answers[q.id] || 'unknown' }))
    });
  };

  const getResultMessage = () => {
    if (score < 50) return { title: "Niveau Critique", message: "Urgence : renforcez vos bases.", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", gaugeColor: "bg-red-500" };
    if (score < 70) return { title: "En Progression", message: "Bon début, mais des failles subsistent.", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", gaugeColor: "bg-orange-500" };
    if (score < 90) return { title: "Bon Niveau", message: "Vous maîtrisez les fondamentaux.", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", gaugeColor: "bg-blue-500" };
    return { title: "Expert Confirmé", message: "Excellent ! Vous êtes un rempart solide.", color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", gaugeColor: "bg-emerald-500" };
  };

  if (!selectedProfile) {
    if (companyProfileLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <TrendingUp className="mx-auto w-12 h-12 text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold mb-8">CyberKit : Diagnostic Adaptatif</h1>
          <div className="grid md:grid-cols-3 gap-6">
            {(Object.entries(PROFILE_CONFIGS) as [ProfileType, any][]).map(([key, config]) => (
              <button key={key} onClick={() => handleProfileSelect(key)} className={`${config.bgColor} border-2 rounded-2xl p-8 hover:scale-105 transition-all`}>
                <config.icon className={`w-10 h-10 ${config.color} mb-4`} />
                <h3 className="text-xl font-bold mb-2">{CYBER_QUIZ_DATA[key].title}</h3>
                <p className="text-sm text-gray-600">{config.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const result = getResultMessage();
    const priorities = getPriorityRecommendations();
    const others = getAllRecommendations().slice(3);

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2">
            <h1 className="text-3xl font-bold text-blue-900 mb-6">CyberKit : Votre Rapport</h1>
            <div className={`text-6xl font-bold ${result.color} mb-4`}>{score}%</div>
            <div className="w-full bg-gray-200 h-4 rounded-full mb-6 overflow-hidden">
              <div className={`h-full ${result.gaugeColor}`} style={{ width: `${score}%` }} />
            </div>
            <p className="text-lg font-medium">{result.message}</p>

            <div className="mt-8 flex gap-4 no-print">
              <button onClick={() => onNavigate('resources')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Ressources</button>
              <button onClick={resetQuiz} className="border-2 px-6 py-3 rounded-xl font-bold">Recommencer</button>
            </div>
          </div>

          <AIAnalysis ref={analysisRef} profile={CYBER_QUIZ_DATA[selectedProfile].title} score={score} level={result.title} weakPoints={priorities.map(p => p.label)} />

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><AlertCircle className="text-blue-600" /> Vos Actions Prioritaires</h3>
            <div className="space-y-4">
              {priorities.map((q, i) => (
                <div key={q.id} className="bg-orange-50 border-l-4 border-orange-500 p-4">
                  <p className="font-bold mb-1">{i + 1}. {q.label}</p>
                  <p className="text-sm text-gray-700 italic">→ {q.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 no-print">
            <button onClick={handleExportPDF} className="flex items-center gap-2 bg-[#E8650A] text-white px-6 py-3 rounded-xl font-bold shadow-lg"><FileDown /> PDF</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 border-2 border-[#E8650A] text-[#E8650A] px-6 py-3 rounded-xl font-bold"><Printer /> Imprimer</button>
          </div>

          <div className="hidden print:block text-center mt-12 border-t pt-6 text-sm text-gray-400">
            Généré par CyberKit — beForensic | cyberkit.be
          </div>
        </div>
      </div>
    );
  }

  const questions = CYBER_QUIZ_DATA[selectedProfile].questions;
  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-2">
        <div className="h-2 bg-gray-100"><div className="h-full bg-blue-500 transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} /></div>
        <div className="p-10 text-center">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Question {currentQuestion + 1} / 10</span>
          <h2 className="text-2xl font-bold my-8 leading-tight">{q.label}</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleAnswer('yes')} className="py-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-all">OUI</button>
            <button onClick={() => handleAnswer('no')} className="py-6 rounded-2xl border-2 border-red-500 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-all">NON</button>
          </div>
          <button onClick={() => handleAnswer('unknown')} className="w-full mt-4 py-4 text-gray-400 text-sm hover:text-gray-600 italic">Je ne sais pas</button>
        </div>
      </div>
    </div>
  );
}