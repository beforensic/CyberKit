import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, ChevronRight, ChevronLeft, Sparkles, CheckCircle, Info, BrainCircuit } from 'lucide-react';

export default function Quiz({ onNavigate }: { onNavigate: (page: any, data?: any) => void }) {
  // --- GARDE LA LOGIQUE DE DONNÉES EXISTANTE ---
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      // On récupère EXACTEMENT les mêmes données qu'avant
      const { data } = await supabase
        .from('questions')
        .select('*, theme:themes(title)')
        .order('id');
      setQuestions(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des questions:", error);
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
      // Scroll automatique vers le haut de la carte pour la question suivante
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Calcul du score identique à ta version actuelle
      const totalScore = Object.values(newAnswers).reduce((a, b) => a + b, 0);
      const maxScore = questions.length * 5;
      const finalPercentage = Math.round((totalScore / maxScore) * 100);

      // On envoie les résultats vers la page de résultats
      onNavigate('results', { score: finalPercentage, answers: newAnswers });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
    </div>
  );

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 pb-20 overflow-hidden relative text-left">

      {/* --- EFFETS VISUELS DE FOND --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] right-[5%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-12 md:pt-20 relative z-10">

        {/* EN-TÊTE */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <BrainCircuit size={14} /> Diagnostic CyberKit
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Analyse de <span className="text-gradient">vulnérabilité.</span>
          </h1>
        </div>

        {/* BARRE DE PROGRESSION DESIGN */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question {currentStep + 1} sur {questions.length}</span>
            <span className="text-xs font-black text-orange-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* CARTE DE QUESTION (GLASSMORPHISM) */}
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-white/5">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                {currentQuestion?.theme?.title || 'Thématique'}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-tight">
              {currentQuestion?.question_text}
            </h2>

            {/* OPTIONS DE RÉPONSE */}
            <div className="space-y-3">
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
                  className="group w-full p-5 bg-white/5 border border-white/5 rounded-2xl text-left transition-all hover:bg-white/10 hover:border-orange-500/30 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-300 group-hover:text-white transition-colors">
                    {option.label}
                  </span>
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700 group-hover:border-orange-500 transition-all flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NAVIGATION BASSE */}
        <div className="mt-8 flex justify-between items-center px-2">
          <button
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${currentStep === 0 ? 'text-slate-800' : 'text-slate-500 hover:text-white'
              }`}
          >
            <ChevronLeft size={14} /> Retour
          </button>

          <div className="flex items-center gap-2 text-slate-600">
            <Info size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Analyse strictement confidentielle</span>
          </div>
        </div>
      </div>
    </div>
  );
}