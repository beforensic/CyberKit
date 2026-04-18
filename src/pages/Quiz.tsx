import { useState, useEffect } from 'react';
import { Shield, ChevronRight, ChevronLeft, RefreshCw, Trophy, BookOpen, AlertCircle, Store, Briefcase, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { saveScore } from '../utils/storage';

interface Profile {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface Question {
  id: string;
  text: string;
  points: number;
  theme?: { title: string };
}

export default function Quiz({ onNavigate }: { onNavigate: (page: any, filter?: string) => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Charger les profils au démarrage
  useEffect(() => {
    async function fetchProfiles() {
      try {
        const { data, error } = await supabase.from('quiz_profiles').select('*');
        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        setError("Impossible de charger les profils.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  // 2. Charger les questions quand un profil est sélectionné
  const startQuiz = async (profile: Profile) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, text, points, theme:themes(title)')
        .eq('profile_id', profile.id)
        .limit(12); // On limite à 12 comme demandé

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Aucune question n'est configurée pour ce profil.");
      }

      setQuestions(data);
      setSelectedProfile(profile);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: boolean) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: value });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const total = questions.reduce((acc, q) => acc + (q.points || 0), 0);
      const user = questions.reduce((acc, q) => answers[q.id] ? acc + (q.points || 0) : acc, 0);
      saveScore(Math.round((user / total) * 100));
      setShowResults(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-orange-500" /></div>;

  // ÉTAPE 0 : Sélection du profil
  if (!selectedProfile && !showResults) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 text-left">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Votre Diagnostic</h1>
          <p className="text-slate-500 mb-10">Choisissez votre profil pour un test personnalisé.</p>

          <div className="grid gap-4">
            {profiles.map((p) => (
              <button key={p.id} onClick={() => startQuiz(p)} className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border-2 border-transparent hover:border-orange-500 shadow-sm transition-all group text-left">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  {p.slug === 'commercant' && <Store className="text-orange-600 group-hover:text-white" />}
                  {p.slug === 'liberal' && <Briefcase className="text-orange-600 group-hover:text-white" />}
                  {p.slug === 'tpe-pme' && <Building2 className="text-orange-600 group-hover:text-white" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{p.name}</h3>
                  <p className="text-sm text-slate-500">{p.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ÉTAPE RÉSULTATS
  if (showResults) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center">
          <Trophy className="w-16 h-16 text-orange-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black mb-10">Analyse terminée !</h2>
          <button onClick={() => onNavigate('resources')} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold">Voir mes ressources</button>
        </div>
      </div>
    );
  }

  // ÉTAPE QUESTIONS
  const q = questions[currentIndex];
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 text-left">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
          <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Question {currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-10 leading-tight">{q.text}</h2>
          <div className="grid gap-3">
            <button onClick={() => handleAnswer(true)} className="w-full p-6 text-left border-2 border-slate-100 rounded-2xl font-bold hover:border-orange-500 transition-all">Oui, absolument</button>
            <button onClick={() => handleAnswer(false)} className="w-full p-6 text-left border-2 border-slate-100 rounded-2xl font-bold hover:border-red-500 transition-all">Non, pas encore</button>
          </div>
        </div>
      </div>
    </div>
  );
}