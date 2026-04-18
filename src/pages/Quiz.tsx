import { useState, useEffect } from 'react';
import { Shield, ChevronRight, ChevronLeft, RefreshCw, Trophy, AlertTriangle, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { saveScore } from '../utils/storage';

interface Question {
  id: string;
  text: string;
  points: number;
  theme_id?: string;
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
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('questions')
        .select(`
          id,
          text,
          points,
          theme:themes (title)
        `)
        .order('created_at', { ascending: true });

      if (supabaseError) throw supabaseError;

      if (!data || data.length === 0) {
        setError("La table des questions est vide. Ajoutez du contenu via l'administration.");
      } else {
        setQuestions(data);
      }
    } catch (err: any) {
      console.error('Erreur Quiz:', err);
      setError("Erreur de connexion à la base de données. Vérifiez vos tables Supabase.");
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
      const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);
      const userPoints = questions.reduce((acc, q) => {
        return answers[q.id] ? acc + (q.points || 0) : acc;
      }, 0);

      const score = totalPoints > 0 ? Math.round((userPoints / totalPoints) * 100) : 0;
      saveScore(score);
      setShowResults(true);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8650A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4 text-left">
        <div className="max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-4">Diagnostic indisponible</h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <button onClick={() => onNavigate('home')} className="w-full py-4 bg-[#E8650A] text-white rounded-2xl font-bold">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);
    const userPoints = questions.reduce((acc, q) => (answers[q.id] ? acc + (q.points || 0) : acc), 0);
    const score = totalPoints > 0 ? Math.round((userPoints / totalPoints) * 100) : 0;

    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 pb-32 text-left">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-10 text-center text-white">
              <Trophy className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2">Résultat : {score}%</h2>
              <p className="text-slate-400">Diagnostic de sécurité terminé</p>
            </div>
            <div className="p-10">
              <button onClick={() => onNavigate('resources')} className="w-full py-4 bg-[#E8650A] text-white rounded-2xl font-bold flex items-center justify-center gap-2 mb-4 shadow-lg shadow-orange-500/20 transition-transform hover:scale-[1.02]">
                <BookOpen className="w-5 h-5" /> Bibliothèque de ressources
              </button>
              <button onClick={() => { setAnswers({}); setCurrentIndex(0); setShowResults(false); }} className="w-full text-slate-400 font-bold py-2">
                <RefreshCw className="w-4 h-4 inline mr-2" /> Recommencer le test
              </button>
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
        <div className="mb-8">
          <button onClick={() => onNavigate('home')} className="text-slate-400 flex items-center gap-2 mb-6 font-medium transition-colors hover:text-slate-600">
            <ChevronLeft className="w-4 h-4" /> Accueil
          </button>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#E8650A] transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-xs font-black text-[#E8650A] uppercase tracking-widest">Question {currentIndex + 1} / {questions.length}</span>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 relative">
          <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black mb-6 uppercase">
            {currentQuestion.theme?.title || 'Sensibilisation'}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-12 leading-tight">
            {currentQuestion.text}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => handleAnswer(true)} className="group flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#E8650A] hover:bg-orange-50 transition-all font-bold text-slate-700">
              Oui, c'est fait <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#E8650A]" />
            </button>
            <button onClick={() => handleAnswer(false)} className="group flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-red-500 hover:bg-red-50 transition-all font-bold text-slate-700">
              Non, pas encore <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}