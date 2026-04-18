import { useState, useEffect } from 'react';
import { Shield, ChevronRight, ChevronLeft, RefreshCw, Trophy, AlertTriangle, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('questions')
        .select('*, theme:themes(title)')
        .order('created_at');

      if (supabaseError) throw supabaseError;

      if (!data || data.length === 0) {
        setError("Aucune question n'a été trouvée dans la base de données.");
      } else {
        setQuestions(data);
      }
    } catch (err) {
      console.error('Erreur chargement questions:', err);
      setError("Impossible de charger le diagnostic. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  const handleAnswer = (value: boolean) => {
    if (!questions[currentIndex]) return;

    setAnswers({ ...answers, [questions[currentIndex].id]: value });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      calculateAndShowResults();
    }
  };

  const calculateAndShowResults = () => {
    const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);
    const userPoints = questions.reduce((acc, q) => {
      return answers[q.id] ? acc + (q.points || 0) : acc;
    }, 0);

    const finalScore = totalPoints > 0 ? Math.round((userPoints / totalPoints) * 100) : 0;
    saveScore(finalScore);
    setShowResults(true);
    window.scrollTo(0, 0);
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
    setError(null);
  };

  // 1. Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8650A]"></div>
      </div>
    );
  }

  // 2. Écran d'erreur (évite la page blanche)
  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oups !</h2>
          <p className="text-slate-500 mb-6">{error || "Le diagnostic est momentanément indisponible."}</p>
          <button onClick={() => onNavigate('home')} className="px-6 py-3 bg-[#E8650A] text-white rounded-xl font-bold">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // 3. Écran des résultats
  if (showResults) {
    const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);
    const userPoints = questions.reduce((acc, q) => (answers[q.id] ? acc + (q.points || 0) : acc), 0);
    const score = totalPoints > 0 ? Math.round((userPoints / totalPoints) * 100) : 0;

    const weakThemes = Array.from(new Set(
      questions
        .filter(q => !answers[q.id])
        .map(q => q.theme?.title)
        .filter(Boolean)
    )).slice(0, 3);

    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-10 text-center text-white">
              <Trophy className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2">Résultat</h2>
              <p className="text-slate-400">Indice de maturité numérique</p>
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
              <div className="space-y-4 mb-10">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">Priorités :</h3>
                {weakThemes.map((theme, i) => (
                  <button key={i} onClick={() => onNavigate('resources', theme)} className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-2xl text-left hover:bg-orange-100 transition-all">
                    <span className="font-bold text-slate-800">{theme}</span>
                    <ArrowRight className="w-4 h-4 text-[#E8650A]" />
                  </button>
                ))}
              </div>
              <button onClick={() => onNavigate('resources')} className="w-full py-4 bg-[#E8650A] text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" /> Bibliothèque de ressources
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Écran de la question en cours
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 pb-32">
      <div className="max-w-2xl mx-auto text-left">
        <div className="mb-8">
          <button onClick={() => onNavigate('home')} className="text-slate-400 flex items-center gap-2 mb-6 font-medium">
            <ChevronLeft className="w-4 h-4" /> Accueil
          </button>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-black text-[#E8650A]">QUESTION {currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#E8650A] transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100">
          <span className="inline-block px-4 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold mb-6">
            {currentQuestion.theme?.title || 'Cyber-Sérénité'}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-12">{currentQuestion.text}</h2>
          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => handleAnswer(true)} className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#E8650A] transition-all font-bold text-slate-700">
              Oui, tout à fait <ChevronRight />
            </button>
            <button onClick={() => handleAnswer(false)} className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-red-500 transition-all font-bold text-slate-700">
              Non, pas encore <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}