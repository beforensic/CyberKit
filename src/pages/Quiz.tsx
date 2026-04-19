import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, ChevronLeft, BrainCircuit, User, Building2, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';

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
      setLoading(true);
      // Requête simplifiée pour éviter les erreurs de jointure
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Erreur de chargement :", error);
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
      onNavigate('results', { score: finalPercentage, answers: newAnswers, profile });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
    </div>
  );

  // --- 1. ÉCRAN DE SÉLECTION DU PROFIL ---
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-300 py-20 px-6 relative overflow-hidden text-left">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[10%] w-[50%] h-[40%] bg-blue-500/10 blur-[150px] rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest mb-8">
            <Shield size={14} /> Étape 1 : Votre Profil
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
            C'est pour <br />
            <span className="text-gradient">quel usage ?</span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
            Le diagnostic adapte ses recommandations selon que vous soyez seul ou en équipe.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'independant', label: 'Indépendant', desc: 'Freelance, artisan, solo-entrepreneur', icon: User },
              { id: 'liberal', label: 'Libéral', desc: 'Avocat, médecin, expert-comptable', icon: Briefcase },
              { id: 'tpe', label: 'TPE / PME', desc: 'Entreprise avec plusieurs employés', icon: Building2 }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setProfile(item.id)}
                className="glass-card p-10 rounded-[3rem] text-left border border-white/5 hover:border-orange-500 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 mb-8 transition-colors">
                  <item.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">{item.label}</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">{item.desc}</p>
                <div className="mt-auto flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-widest">
                  Choisir <ArrowRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 2. ÉCRAN DU QUESTIONNAIRE ---
  if (questions.length === 0) return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white p-6">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <p className="text-xl font-bold">Aucune question trouvée dans la base de données.</p>
    </div>
  );

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 pb-20 overflow-hidden relative text-left">
      <div className="max-w-3xl mx-auto px-6 pt-16 md:pt-24 relative z-10">

        {/* PROGRESSION */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4 font-black uppercase tracking-widest text-[10px]">
            <span className="text-slate-500">Diagnostic CyberKit</span>
            <span className="text-orange-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-rose-600 transition-all duration-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* CARTE QUESTION */}
        <div className="glass-card rounded-[3.5rem] p-10 md:p-16 border border-white/5 shadow-2xl relative">

          <div className="flex items-center gap-4 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-orange-400">
              Question {currentStep + 1}
            </span>
            <span>/</span>
            <span>{questions.length}</span>
          </div>

          {/* LA QUESTION (Forcée en blanc et grand) */}
          <h2 className="text-3xl md:text-5xl font-black text-white mb-16 leading-[1.1] tracking-tighter">
            {currentQuestion?.question_text || "La question est en cours de chargement..."}
          </h2>

          {/* RÉPONSES */}
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "Pas du tout / Jamais", val: 1 },
              { label: "Plutôt non / Rarement", val: 2 },
              { label: "Moyennement / Parfois", val: 3 },
              { label: "Plutôt oui / Souvent", val: 4 },
              { label: "Tout à fait / Toujours", val: 5 }
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleAnswer(opt.val)}
                className="group w-full p-6 bg-slate-800/40 border border-white/5 rounded-2xl text-left transition-all hover:bg-orange-500 hover:border-orange-500 flex items-center justify-between"
              >
                <span className="font-bold text-slate-300 group-hover:text-white transition-colors">
                  {opt.label}
                </span>
                <div className="w-6 h-6 rounded-full border-2 border-slate-700 group-hover:border-white transition-all flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RETOUR */}
        <div className="mt-10 px-4">
          <button
            onClick={() => currentStep === 0 ? setProfile(null) : setCurrentStep(currentStep - 1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
          >
            <ChevronLeft size={16} /> Revenir en arrière
          </button>
        </div>
      </div>
    </div>
  );
}