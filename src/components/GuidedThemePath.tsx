import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, ArrowRight, Loader2, Target } from 'lucide-react';
import { getIconComponent } from '../utils/icons';
import {
  fetchAndBuildGuidedPath,
  saveGuidedPath,
  type GuidedThemeStep,
} from '../utils/quizGuidedPath';
import { saveThemeInterest } from '../utils/storage';

interface GuidedThemePathProps {
  answers: Record<string, number>;
}

export default function GuidedThemePath({ answers }: GuidedThemePathProps) {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<GuidedThemeStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchAndBuildGuidedPath(answers)
      .then((path) => {
        if (cancelled) return;
        setSteps(path);
        saveGuidedPath(path);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [answers]);

  const startPath = (step: GuidedThemeStep) => {
    saveThemeInterest(step.themeTitle);
    navigate(`/resources?themeId=${step.themeId}`, {
      state: { themeId: step.themeId, guidedPath: true },
    });
  };

  if (loading) {
    return (
      <div className="mt-12 surface-card-dark p-8 flex items-center justify-center gap-3" role="status">
        <Loader2 className="w-6 h-6 text-brand-orange animate-spin" aria-hidden="true" />
        <span className="text-slate-400 font-medium">Préparation de votre parcours…</span>
      </div>
    );
  }

  if (steps.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 surface-card-dark p-8 md:p-10" aria-labelledby="guided-path-title">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-brand-orange/15 p-3 rounded-2xl">
          <Map className="w-6 h-6 text-brand-orange" aria-hidden="true" />
        </div>
        <div>
          <h2 id="guided-path-title" className="text-2xl font-bold text-white">
            Votre parcours thématique
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {steps.length} thème{steps.length > 1 ? 's' : ''} à renforcer en priorité, dans l&apos;ordre.
          </p>
        </div>
      </div>

      <ol className="space-y-4 mb-8">
        {steps.map((step) => {
          const Icon = getIconComponent(step.themeTitle);
          return (
            <li
              key={step.themeId}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand-orange shrink-0 font-bold text-sm">
                  {step.stepIndex}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-brand-orange shrink-0" aria-hidden="true" />
                    <h3 className="font-bold text-white truncate">{step.themeTitle}</h3>
                  </div>
                  {step.weakQuestions.length > 0 ? (
                    <p className="text-sm text-slate-400 line-clamp-2">
                      <Target className="inline w-3.5 h-3.5 mr-1 text-brand-orange-300" aria-hidden="true" />
                      {step.weakQuestions.join(' · ')}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">Consolider vos bonnes pratiques sur ce thème.</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => startPath(step)}
                className="focus-ring shrink-0 px-5 py-3 bg-brand-orange text-white rounded-xl font-semibold text-sm hover:bg-brand-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                {step.stepIndex === 1 ? 'Commencer' : 'Voir le thème'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={() => startPath(steps[0])}
        className="focus-ring w-full py-4 bg-white/10 border border-white/15 text-white rounded-2xl font-bold hover:bg-white/15 transition-colors flex items-center justify-center gap-2"
      >
        Lancer le parcours complet
        <ArrowRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </section>
  );
}
