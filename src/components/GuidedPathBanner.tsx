import { useNavigate } from 'react-router-dom';
import { Map, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  clearGuidedPath,
  getGuidedPathProgress,
  type GuidedPathProgress,
} from '../utils/quizGuidedPath';
import { saveThemeInterest } from '../utils/storage';

interface GuidedPathBannerProps {
  themeId: string | null;
  onThemeChange: (id: string) => void;
  onPathChange?: () => void;
}

export default function GuidedPathBanner({
  themeId,
  onThemeChange,
  onPathChange,
}: GuidedPathBannerProps) {
  const navigate = useNavigate();
  const progress: GuidedPathProgress | null = getGuidedPathProgress(themeId);

  if (!progress) return null;

  const goToTheme = (id: string, title: string) => {
    saveThemeInterest(title);
    onThemeChange(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishPath = () => {
    clearGuidedPath();
    onPathChange?.();
    navigate('/quiz/resultats');
  };

  const exitPath = () => {
    clearGuidedPath();
    onPathChange?.();
  };

  return (
    <div className="bg-slate-900 text-white px-4 py-5 border-b border-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-brand-orange/15 shrink-0">
              <Map className="w-5 h-5 text-brand-orange" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-orange-300">
                Parcours personnalisé · Étape {progress.current.stepIndex} sur {progress.steps.length}
              </p>
              <h2 className="text-lg font-bold truncate">{progress.current.themeTitle}</h2>
              {progress.current.weakQuestions[0] && (
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                  Priorité : {progress.current.weakQuestions[0]}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => progress.previous && goToTheme(progress.previous.themeId, progress.previous.themeTitle)}
              disabled={!progress.previous}
              aria-label="Thème précédent du parcours"
              className="focus-ring p-3 rounded-xl bg-white/10 disabled:opacity-30 hover:bg-white/15 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-1.5 px-2" aria-hidden="true">
              {progress.steps.map((step) => (
                <span
                  key={step.themeId}
                  className={`h-2 rounded-full transition-all ${
                    step.themeId === progress.current.themeId
                      ? 'w-6 bg-brand-orange'
                      : 'w-2 bg-white/25'
                  }`}
                />
              ))}
            </div>

            {progress.next ? (
              <button
                type="button"
                onClick={() => goToTheme(progress.next!.themeId, progress.next!.themeTitle)}
                className="focus-ring px-4 py-3 rounded-xl bg-brand-orange font-semibold text-sm hover:bg-brand-orange-600 transition-colors flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishPath}
                className="focus-ring px-4 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors"
              >
                Terminer
              </button>
            )}

            <button
              type="button"
              onClick={exitPath}
              aria-label="Quitter le parcours guidé"
              className="focus-ring p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors ml-1"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
