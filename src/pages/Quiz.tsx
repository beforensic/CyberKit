import { useState, useEffect } from 'react';
import { Shield, ChevronRight, ChevronLeft, RefreshCw, Trophy, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { saveScore } from '../utils/storage';

interface Question {
  id: string;
  text: string;
  points: number;
  theme_id: string;
  theme?: { title: string };
}

interface QuizProps {
  onNavigate: (page: any, filter?: string) => void;
}

export default function Quiz({ onNavigate }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*, theme:themes(title)')
        .order('created_at');

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Erreur chargement questions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAnswer = (value: boolean) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: value });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      calculateAndShowResults();
    }
  };

  const calculateAndShowResults = () => {
    const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
    const userPoints = questions.reduce((acc, q) => {
      return answers[q.id] ? acc + q.points : acc;
    }, 0);

    const finalScore = Math.round((userPoints / totalPoints) * 100);
    saveScore(finalScore);
    setShowResults(true);
    window.scrollTo(0, 0);
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8650A]"></div>
      </div>
    );
  }

  if (showResults) {
    const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
    const userPoints = questions.reduce((acc, q) => (answers[q.id] ? acc + q.points : acc), 0);
    const score = Math.round((userPoints / totalPoints) * 100);

    // Identifier les thèmes à travailler (ceux où l'utilisateur a répondu "Non")
    const weakThemes = Array.from(new Set(
      questions
        .filter(q => !answers[q.id])
        .map(q => q.theme?.title)
        .filter(Boolean)
    )).slice(0, 3);

    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 pb-32 text-left">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-10 text-center text-white">
              <Trophy className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2">Diagnostic terminé !</h2>
              <p className="text-slate-400">Voici votre niveau de maturité numérique actuel</p>
            </div>

            <div className="p-10">
              <div className="flex justify-center mb-10">
                <div className="relative flex items-center justify-center">
                  <svg className="w-48 h-48">
                    <circle className="text-slate-100" strokeWidth="12" stroke="currentColor" fill="transparent" r="80" cx="96" cy="96" />
                    <circle className="text-[#E8650A]" strokeWidth="12" strokeDasharray={2 * Math.PI * 80} strokeDashoffset={2 * Math.PI * 80 * (1 - score / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="80" cx="96" cy="96" />
                  </svg>
                  <span className="absolute text-5xl font-black text-slate-900">{score}%</span>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="text-orange-500 w-5 h-5" />
                  Priorités recommandées :
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {weakThemes.map((theme, i) => (
                    <button
                      key={i}
                      onClick={() => onNavigate('resources', theme)}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100 hover:bg-orange-100 transition-colors group"
                    >
                      <span className="font-bold text-slate-800">{theme}</span>
                      <ArrowRight className="w-4 h-4 text-[#E8650A] group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => onNavigate('resources')}
                  className="w-full py-4 bg-[#E8650A] text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  <BookOpen className="w-5 h-5" /> Explorer toutes les ressources
                </button>
                <button
                  onClick={resetQuiz}
                  className="w-full py-4 bg-white text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Recommencer le test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 pb-32 text-left">
      <div className="max-w-2xl mx-auto">
        {/* Header & Progress */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="text-slate-400 hover:text-slate-600 flex items-center gap-2 mb-6 font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
          </button>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-black text-[#E8650A] uppercase tracking-widest">Question {currentIndex + 1} / {questions.length}</span>
            <span className="text-sm font-bold text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E8650A] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield className="w-32 h-32 text-slate-900" />
          </div>

          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
              {currentQuestion.theme?.title || 'Thématique'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-12 leading-tight">
              {currentQuestion.text}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleAnswer(true)}
                className="group flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#E8650A] hover:bg-orange-50 transition-all text-left"
              >
                <span className="text-xl font-bold text-slate-700 group-hover:text-[#E8650A]">Oui, tout à fait</span>
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-[#E8650A] group-hover:bg-[#E8650A]">
                  <ChevronRight className="w-5 h-5 text-transparent group-hover:text-white" />
                </div>
              </button>

              <button
                onClick={() => handleAnswer(false)}
                className="group flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-red-500 hover:bg-red-50 transition-all text-left"
              >
                <span className="text-xl font-bold text-slate-700 group-hover:text-red-600">Non, pas encore</span>
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-500">
                  <ChevronRight className="w-5 h-5 text-transparent group-hover:text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center px-4 text-slate-400">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="flex items-center gap-2 font-bold disabled:opacity-0 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" /> Précédent
          </button>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-[#E8650A] w-4' : 'bg-slate-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}