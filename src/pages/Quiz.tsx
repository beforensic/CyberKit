import { useState, useEffect } from 'react';
import { Shield, ChevronRight, ChevronLeft, RefreshCw, Trophy, BookOpen, AlertCircle, Store, Briefcase, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { saveScore } from '../utils/storage';
// Importation du composant d'analyse IA
import AIAnalysis from '../components/AIAnalysis';

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

  // Charger les profils disponibles
  useEffect(() => {
    async function fetchProfiles() {
      try {
        const { data, error } = await supabase.from('quiz_profiles').select('*');
        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        setError("Impossible de charger les profils de diagnostic.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  // Lancer le quiz pour un profil spécifique
  const startQuiz = async (profile: Profile) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, text, points, theme:themes(title)')
        .eq('profile_id', profile.id)
        .limit(12);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Désolé, aucune question n'est encore configurée pour ce profil.");
      }

      setQuestions(data);
      setSelectedProfile(profile);
      setCurrentIndex(0);
      setAnswers({});
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: boolean) => {
    const newAnswers = { ...answers, [questions[currentIndex].id]: value };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calcul du score final
      const total = questions.reduce((acc, q) => acc + (q.points || 0), 0);
      const user = questions.reduce((acc, q) => newAnswers[q.id] ? acc + (q.points || 0) : acc, 0);
      const finalScore = Math.round((user / total) * 100);

      saveScore(finalScore);
      setShowResults(true);
      window.scrollTo(0, 0);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <RefreshCw className="animate-spin text-[#E8650A] w-10 h-10" />
    </div>
  );

  // ÉCRAN 1 : SÉLECTION DU PROFIL
  if (!selectedProfile && !showResults) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 text-left pb-32">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => onNavigate('home')} className="text-slate-400 mb-8 flex items-center gap-2 font-bold">
            <ChevronLeft size={18} /> Retour
          </button>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Diagnostic Cyber</h1>
          <p className="text-slate-500 mb-12 text-lg">Sélectionnez votre activité pour des questions adaptées à votre réalité quotidienne.</p>

          <div className="grid gap-4">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => startQuiz(p)}
                className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border-2 border-transparent hover:border-[#E8650A] shadow-sm transition-all group text-left"
              >
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-[#E8650A] transition-colors shrink-0">
                  {p.slug === 'commercant' && <Store className="text-[#E8650A] group-hover:text-white" size={28} />}
                  {p.slug === 'liberal' && <Briefcase className="text-[#E8650A] group-hover:text-white" size={28} />}
                  {p.slug === 'tpe-pme' && <Building2 className="text-[#E8650A] group-hover:text-white" size={28} />}
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 mb-1">{p.name}</h3>
                  <p className="text-slate-500 leading-tight">{p.description}</p>
                </div>
                <ChevronRight className="ml-auto text-slate-200 group-hover:text-[#E8650A]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ÉCRAN 2 : RÉSULTATS (AVEC IA)
  if (showResults) {
    const total = questions.reduce((acc, q) => acc + (q.points || 0), 0);
    const user = questions.reduce((acc, q) => answers[q.id] ? acc + (q.points || 0) : acc, 0);
    const score = Math.round((user / total) * 100);

    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 text-left pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100 mb-8">
            <div className="bg-slate-900 p-12 text-center text-white">
              <Trophy className="w-16 h-16 text-orange-400 mx-auto mb-6" />
              <h2 className="text-4xl font-black mb-2 tracking-tighter">Score : {score}%</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Maturité numérique calculée</p>
            </div>

            <div className="p-10">
              {/* L'ANALYSE IA EST PLACÉE ICI */}
              <AIAnalysis
                score={score}
                answers={answers}
                profileName={selectedProfile?.name || 'Utilisateur'}
              />

              <div className="mt-12 flex flex-col gap-4">
                <button
                  onClick={() => onNavigate('resources')}
                  className="w-full py-5 bg-[#E8650A] text-white rounded-[2rem] font-black text-lg shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  <BookOpen size={22} /> Découvrir mes ressources
                </button>
                <button
                  onClick={() => { setSelectedProfile(null); setShowResults(false); }}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                  <RefreshCw size={18} className="inline mr-2" /> Recommencer un test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ÉCRAN 3 : QUESTIONS
  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 text-left pb-32">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <span className="text-xs font-black text-[#E8650A] uppercase tracking-widest">
              Question {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-slate-300 font-black">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#E8650A] transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-xl border border-slate-100 relative">
          <span className="inline-block px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black mb-8 uppercase tracking-widest">
            {currentQ.theme?.title || selectedProfile?.name}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-12 leading-tight">
            {currentQ.text}
          </h2>
          <div className="grid gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className="flex items-center justify-between w-full p-7 bg-white border-2 border-slate-50 rounded-[2rem] font-black text-xl text-slate-700 hover:border-[#E8650A] hover:bg-orange-50 transition-all group"
            >
              Oui, tout à fait
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#E8650A] group-hover:text-white transition-colors">
                <ChevronRight size={24} />
              </div>
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex items-center justify-between w-full p-7 bg-white border-2 border-slate-50 rounded-[2rem] font-black text-xl text-slate-700 hover:border-red-500 hover:bg-red-50 transition-all group"
            >
              Non, pas encore
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                <ChevronRight size={24} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}