import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ChevronLeft, User, Building2, Briefcase, ArrowRight, HelpCircle, AlertCircle } from 'lucide-react';
import { saveQuizResults, calculateQuizScore } from '../utils/quizResults';
import { trackDiagnosticCompletion } from '../services/analytics';
import {
  fetchQuizQuestions,
  filterQuestionsByProfile,
  type QuizQuestion,
} from '../services/quizQuestions';

export default function Quiz() {
  const navigate = useNavigate();
  const questionRef = useRef<HTMLHeadingElement>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [profile, setProfile] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setLoadError(null);
        const rows = await fetchQuizQuestions();
        if (!cancelled) setQuestions(rows);
      } catch {
        if (!cancelled) {
          setLoadError(
            'Impossible de charger les questions du diagnostic. Réessayez dans un instant ou contactez-nous.',
          );
          setQuestions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeQuestions = profile
    ? filterQuestionsByProfile(questions, profile)
    : questions;

  useEffect(() => {
    if (profile && activeQuestions.length > 0) {
      questionRef.current?.focus();
    }
  }, [currentStep, profile, activeQuestions.length]);

  const handleAnswer = (value: number) => {
    const currentQuestion = activeQuestions[currentStep];
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentStep < activeQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const finalPercentage = calculateQuizScore(newAnswers);
      const resultData = { score: finalPercentage, answers: newAnswers, profile: profile! };
      saveQuizResults(resultData);
      void trackDiagnosticCompletion(finalPercentage, profile!);
      navigate('/quiz/resultats', { state: resultData });
    }
  };

  if (loading) {
    return (
      <div className="page-dark flex items-center justify-center" role="status" aria-live="polite">
        <div className="animate-spin h-12 w-12 rounded-full border-2 border-slate-700 border-t-slate-300" aria-hidden="true" />
        <span className="sr-only">Chargement des questions du diagnostic</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-dark flex flex-col items-center justify-center px-6 text-center min-h-[60vh]" role="alert">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" aria-hidden="true" />
        <p className="text-slate-300 max-w-md">{loadError}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-dark py-16 px-6 relative text-left">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Shield size={14} aria-hidden="true" /> Diagnostic Personnalisé
          </div>
          <h1 className="font-display font-semibold text-[clamp(1.75rem,4vw,2.5rem)] md:text-[clamp(2.5rem,7vw,4.5rem)] text-white mb-6">
            Commençons par votre profil
          </h1>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl">
            Sélectionnez votre situation pour adapter les recommandations à votre quotidien.
          </p>

          <fieldset>
            <legend className="sr-only">Choisissez votre profil</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'independant', label: 'Indépendant', desc: 'Freelance ou artisan', icon: User },
                { id: 'liberal', label: 'Libéral', desc: 'Santé, Droit, Conseil...', icon: Briefcase },
                { id: 'tpe', label: 'TPE / PME', desc: 'Entreprise avec salariés', icon: Building2 },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setProfile(item.id);
                    setCurrentStep(0);
                    setAnswers({});
                  }}
                  className="focus-ring bg-slate-800/40 backdrop-blur-md border border-slate-700 p-8 rounded-3xl text-left hover:border-brand-orange transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-orange mb-6 transition-colors">
                    <item.icon size={24} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.label}</h3>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center gap-2 text-brand-orange font-bold text-xs uppercase tracking-widest">
                    Choisir <ArrowRight size={14} aria-hidden="true" />
                  </div>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    );
  }

  if (activeQuestions.length === 0) {
    return (
      <div className="page-dark flex flex-col items-center justify-center px-6 text-center min-h-[60vh]" role="alert">
        <AlertCircle className="w-12 h-12 text-brand-orange mb-4" aria-hidden="true" />
        <p className="text-slate-300 mb-6">Aucune question disponible pour ce profil.</p>
        <button
          type="button"
          onClick={() => setProfile(null)}
          className="focus-ring px-6 py-3 bg-brand-orange text-white rounded-xl font-bold"
        >
          Changer de profil
        </button>
      </div>
    );
  }

  const currentQuestion = activeQuestions[currentStep];
  const progress = ((currentStep + 1) / activeQuestions.length) * 100;

  return (
    <div className="page-dark pb-8 relative text-left">
      <div className="max-w-3xl mx-auto px-6 pt-16 relative z-10">

        <div className="mb-10" aria-live="polite" aria-atomic="true">
          <div className="flex justify-between items-end mb-3 text-xs font-semibold text-slate-400">
            <span className="text-slate-500">
              Question {currentStep + 1} sur {activeQuestions.length}
            </span>
            <span className="text-brand-orange">{Math.round(progress)}%</span>
          </div>
          <div
            className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progression du diagnostic"
          >
            <div
              className="h-full bg-brand-orange transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="surface-card-dark p-8 md:p-12 shadow-lg">

          <div className="flex items-center gap-2 mb-8">
            <div className="px-3 py-1 bg-white/5 rounded-md border border-white/10 text-xs font-semibold text-brand-orange-400">
              {currentQuestion.themeTitle}
            </div>
          </div>

          <h2
            id="quiz-question"
            ref={questionRef}
            tabIndex={-1}
            className="focus-ring text-xl md:text-2xl font-semibold text-white mb-10 leading-relaxed outline-none rounded-lg"
          >
            {currentQuestion.label}
          </h2>

          <div
            role="radiogroup"
            aria-labelledby="quiz-question"
            className="grid grid-cols-1 gap-3"
          >
            {[
              { label: 'Pas du tout / Jamais', val: 1 },
              { label: 'Plutôt non / Rarement', val: 2 },
              { label: 'Moyennement / Parfois', val: 3 },
              { label: 'Plutôt oui / Souvent', val: 4 },
              { label: 'Tout à fait / Toujours', val: 5 },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => handleAnswer(opt.val)}
                aria-label={`${opt.label}, note ${opt.val} sur 5`}
                className="focus-ring w-full p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-left transition-all hover:bg-brand-orange hover:border-brand-orange flex items-center justify-between group"
              >
                <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                  {opt.label}
                </span>
                <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-white flex items-center justify-center" aria-hidden="true">
                  <div className="w-2 h-2 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center px-2">
          <button
            type="button"
            onClick={() => (currentStep === 0 ? setProfile(null) : setCurrentStep(currentStep - 1))}
            className="focus-ring flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all"
          >
            <ChevronLeft size={14} aria-hidden="true" /> Retour
          </button>
          <Link
            to="/contact"
            className="focus-ring flex items-center gap-2 text-slate-600 hover:text-brand-orange transition-all"
          >
            <HelpCircle size={14} aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Besoin d&apos;aide ?</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
