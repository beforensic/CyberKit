import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, ArrowRight, BookOpen, RotateCcw } from 'lucide-react';
import AIAnalysis from '../components/AIAnalysis';
import ContactCtaBanner from '../components/ContactCtaBanner';
import { saveScore } from '../utils/storage';
import {
  getQuizResults,
  getScoreLevel,
  PROFILE_LABELS,
  type QuizResultData,
} from '../utils/quizResults';

export default function QuizResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as QuizResultData | null;
  const results = stateData ?? getQuizResults();

  useEffect(() => {
    if (results) {
      saveScore(results.score);
    }
  }, [results]);

  if (!results) {
    return (
      <div className="page-dark flex flex-col items-center justify-center px-6 text-center min-h-[60vh]">
        <Shield className="w-16 h-16 text-brand-orange mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">Aucun résultat disponible</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          Complétez le diagnostic pour obtenir votre score et vos recommandations personnalisées.
        </p>
        <Link
          to="/quiz"
          className="focus-ring px-8 py-4 bg-brand-orange text-white rounded-2xl font-bold hover:bg-brand-orange-600 transition-colors"
        >
          Lancer le diagnostic
        </Link>
      </div>
    );
  }

  const { score, answers, profile } = results;
  const level = getScoreLevel(score);
  const profileLabel = PROFILE_LABELS[profile] || profile;

  const scoreColor =
    score < 50 ? 'text-red-400' :
    score < 70 ? 'text-orange-400' :
    score < 90 ? 'text-blue-400' :
    'text-brand-orange-400';

  const ringColor =
    score < 50 ? 'border-red-400' :
    score < 70 ? 'border-orange-400' :
    score < 90 ? 'border-blue-400' :
    'border-brand-orange-400';

  return (
    <div className="page-dark pb-24 relative text-left">
      <div className="max-w-4xl mx-auto px-6 pt-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange-400 text-[10px] font-bold uppercase tracking-widest mb-6">
          <Shield size={14} /> Résultats du diagnostic
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Votre score de sécurité
        </h1>
        <p className="text-slate-400 mb-12">
          Profil : <span className="text-white font-semibold">{profileLabel}</span>
        </p>

        <div className="bg-slate-800/20 backdrop-blur-md border border-slate-700/50 rounded-[2.5rem] p-8 md:p-12 mb-8 text-center">
          <div
            className={`inline-flex items-center justify-center w-40 h-40 rounded-full border-8 ${ringColor} mb-6`}
            role="img"
            aria-label={`Score de sécurité : ${score} pour cent`}
          >
            <span className={`text-5xl font-black ${scoreColor}`} aria-hidden="true">{score}%</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{level.label}</h2>
          <p className="text-slate-400">{level.description}</p>
        </div>

        <AIAnalysis
          score={score}
          answers={answers}
          profileName={profileLabel}
        />

        <div className="mt-12">
          <ContactCtaBanner
            variant="dark"
            subject={`Besoin d'accompagnement (Score: ${score}%)`}
            title="Aller plus loin que le diagnostic ?"
            description={`Votre score est de ${score} %. Un échange personnalisé avec beForensic peut vous aider à prioriser les actions concrètes pour votre activité.`}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => navigate('/resources')}
            className="focus-ring flex items-center justify-center gap-3 p-6 bg-slate-800/40 border border-slate-700 rounded-2xl text-white font-bold hover:border-brand-orange transition-all"
          >
            <BookOpen size={20} className="text-brand-orange" aria-hidden="true" />
            Voir les ressources
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/quiz')}
            className="focus-ring flex items-center justify-center gap-3 p-6 bg-slate-800/40 border border-slate-700 rounded-2xl text-white font-bold hover:border-brand-orange transition-all"
          >
            <RotateCcw size={20} className="text-brand-orange" aria-hidden="true" />
            Refaire le test
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
