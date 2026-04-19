import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, ChevronLeft, BrainCircuit, User, Building2, Briefcase, ArrowRight } from 'lucide-react';

export default function Quiz({ onNavigate }: { onNavigate: (page: any, data?: any) => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [profile, setProfile] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const { data } = await supabase
        .from('questions')
        .select('*, theme:themes(title)')
        .order('id');
      setQuestions(data || []);
    } catch (error) {
      console.error("Erreur de chargement des questions :", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAnswer = (value: number) => {
    const currentQuestion = questions[currentStep];
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const totalScore = Object.values(newAnswers).reduce((a, b) => a + b, 0);
      const maxScore = questions.length * 5;
      const finalPercentage = Math.round((totalScore / maxScore) * 100);

      // Envoi vers les résultats avec le profil inclus
      onNavigate('results', {
        score: finalPercentage,
        answers: newAnswers,
        profile: profile
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
    </div>
  );

  // --- ÉCRAN 1 : SÉLECTION DU PROFIL ---
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-300 py-20 px-6 relative overflow-hidden text-left">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[10%] w-[50%] h-[40%] bg-blue-500/10 blur-[150px] rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest mb-8">
            <Shield size={14} /> Étape 1 : Personnalisation
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
            Quel est votre <br />
            <span className="text-gradient">profil métier ?</span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
            Pour que le diagnostic soit pertinent, nous adaptons nos questions à votre réalité quotidienne.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'independant', label: 'Indépendant', desc: 'Auto-entrepreneur ou Freelance', icon: User },
              { id: 'liberal', label: 'Libéral', desc: 'Médecin, Avocat, Consultant...', icon: Briefcase },
              { id: 'tpe', label: 'TPE / PME', desc: 'Structure avec salariés', icon: Building2 }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setProfile(item.id)}
                className="glass-card p-8 rounded-[2.5rem] text-left border border-white/5 hover:border-orange-500/40 transition-all group flex flex-col h-full"
              >
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 mb-6 transition-colors shadow-inner">
                  <item.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{item.label}</h3>
                <p className="text-sm text-slate-500 mb-8 flex-grow">{item.desc}</p>
                <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-widest">
                  Choisir ce profil <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- ÉCRAN 2 : LE QUESTIONNAIRE ---
  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 pb-20 overflow-hidden relative text-left">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-12 md:pt-20 relative z-10">
        {/* BARRE DE PROGRESSION */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} className="text-blue-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diagnostic en cours...</span>
            </div>
            <span className="text-xs font-black text-orange-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* CARTE DE LA QUESTION */}
        <div className="glass-card rounded-[3rem] p-10 md:p-14 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                {currentQuestion?.theme?.title || 'Thématique'}
              </span>
              <span className="text-slate-700">/</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Question {currentStep + 1}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-12 leading-[1.15] tracking-tight">
              {currentQuestion?.question_text}
            </h2>

            {/* OPTIONS DE RÉPONSE */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Pas du tout / Jamais", value: 1 },
                { label: "Plutôt non / Rarement", value: 2 },
                { label: "Moyennement / Parfois", value: 3 },
                { label: "Plutôt oui / Souvent", value: 4 },
                { label: "Tout à fait / Toujours", value: 5 }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="group w-full p-6 bg-white/5 border border-white/5 rounded-2xl text-left transition-all hover:bg-orange-500 hover:border-orange-500 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-300 group-hover:text-white transition-colors">
                    {option.label}
                  </span>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-700 group-hover:border-white transition-all flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PIED DE PAGE NAVIGATION */}
        <div className="mt-8 flex justify-between items-center px-4">
          <button
            onClick={() => {
              if (currentStep === 0) setProfile(null);
              else setCurrentStep(currentStep - 1);
            }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} /> Retour
          </button>
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Analyse confidentielle
          </div>
        </div>
      </div>
    </div>
  );
}