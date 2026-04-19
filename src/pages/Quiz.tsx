import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, ChevronLeft, User, Building2, Briefcase, ArrowRight, HelpCircle } from 'lucide-react';

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
      // On récupère tout proprement, y compris le titre du thème
      const { data, error } = await supabase
        .from('questions')
        .select('*, themes(title)')
        .order('id');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Erreur technique :", error);
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

  // --- ÉTAPE 1 : CHOIX DU PROFIL ---
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-300 py-16 px-6 relative text-left">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Shield size={14} /> Diagnostic Personnalisé
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Commençons par votre profil
          </h1>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl">
            Sélectionnez votre situation pour adapter les recommandations à votre quotidien.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'independant', label: 'Indépendant', desc: 'Freelance ou artisan', icon: User },
              { id: 'liberal', label: 'Libéral', desc: 'Santé, Droit, Conseil...', icon: Briefcase },
              { id: 'tpe', label: 'TPE / PME', desc: 'Entreprise avec salariés', icon: Building2 }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setProfile(item.id)}
                className="bg-slate-800/40 backdrop-blur-md border border-slate-700 p-8 rounded-3xl text-left hover:border-orange-500 transition-all group"
              >
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 mb-6 transition-colors">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.label}</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">{item.desc}</p>
                <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-widest">
                  Choisir <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- ÉTAPE 2 : LE QUESTIONNAIRE ---
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 pb-20 relative text-left">
      <div className="max-w-3xl mx-auto px-6 pt-16 relative z-10">

        {/* Progression discrète */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-3 text-[10px] font-bold uppercase tracking-widest">
            <span className="text-slate-500">Question {currentStep + 1} sur {questions.length}</span>
            <span className="text-orange-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Carte Question */}
        <div className="bg-slate-800/20 backdrop-blur-md border border-slate-700/50 rounded-[2.5rem] p-8 md:p-12 shadow-xl">

          <div className="flex items-center gap-2 mb-8">
            <div className="px-3 py-1 bg-white/5 rounded-md border border-white/10 text-[10px] font-bold text-orange-400 uppercase tracking-widest">
              {currentQuestion?.themes?.title || 'Thème'}
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-white mb-10 leading-relaxed">
            {currentQuestion?.question_text}
          </h2>

          <div className="grid grid-cols-1 gap-3">
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
                className="w-full p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-left transition-all hover:bg-orange-500 hover:border-orange-500 flex items-center justify-between group"
              >
                <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                  {opt.label}
                </span>
                <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center px-2">
          <button
            onClick={() => currentStep === 0 ? setProfile(null) : setCurrentStep(currentStep - 1)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all"
          >
            <ChevronLeft size={14} /> Retour
          </button>
          <div className="flex items-center gap-2 text-slate-600">
            <HelpCircle size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Besoin d'aide ?</span>
          </div>
        </div>
      </div>
    </div>
  );
}