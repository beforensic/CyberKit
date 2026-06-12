import { useState, useEffect, useCallback } from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getScoreLevel } from '../utils/quizResults';
import { getQuizWeakPoints } from '../utils/quizWeakPoints';
import {
  buildAiAnalysisCacheKey,
  getCachedAiAnalysis,
  setCachedAiAnalysis,
} from '../utils/aiAnalysisCache';

interface AIAnalysisProps {
  score: number;
  answers: Record<string, number>;
  profileName: string;
}

const FALLBACK_ANALYSIS =
  "L'analyse IA est momentanément indisponible, mais vos résultats indiquent que vous devriez prioriser la sécurisation de vos sauvegardes et de vos mots de passe.";

export default function AIAnalysis({ score, answers, profileName }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [priorityHint, setPriorityHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const generateAnalysis = useCallback(async () => {
    const cacheKey = buildAiAnalysisCacheKey(profileName, score, answers);
    const cached = getCachedAiAnalysis(cacheKey);

    if (cached) {
      setAnalysis(cached.analysis);
      setPriorityHint(cached.priorityHint);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const level = getScoreLevel(score);
      const weakPoints = await getQuizWeakPoints(answers);
      const topPriority = weakPoints[0] ?? null;
      setPriorityHint(topPriority);

      const { data, error } = await supabase.functions.invoke('generate-analysis', {
        body: {
          profile: profileName,
          score,
          level: level.label,
          weakPoints,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const generatedAnalysis = data.analysis ?? null;
      if (!generatedAnalysis?.trim()) {
        throw new Error('Empty analysis');
      }

      setAnalysis(generatedAnalysis);
      setCachedAiAnalysis(cacheKey, {
        analysis: generatedAnalysis,
        priorityHint: topPriority,
      });
    } catch (err) {
      console.error('Erreur IA:', err);
      setAnalysis(FALLBACK_ANALYSIS);
    } finally {
      setLoading(false);
    }
  }, [score, answers, profileName]);

  useEffect(() => {
    generateAnalysis();
  }, [generateAnalysis]);

  const strengthText =
    score >= 70
      ? 'Vous avez déjà de solides réflexes de protection.'
      : 'Votre démarche de diagnostic montre une vraie prise de conscience des risques.';

  return (
    <div className="mt-12 bg-slate-900 rounded-panel p-8 md:p-12 text-white relative overflow-hidden text-left shadow-xl border border-slate-800">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <BrainCircuit size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-orange p-3 rounded-2xl">
            <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Analyse personnalisée</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-10 gap-4" role="status" aria-live="polite">
            <Loader2 className="w-10 h-10 text-brand-orange animate-spin" aria-hidden="true" />
            <p className="text-slate-400 font-bold motion-safe:animate-pulse text-center">
              Génération de votre analyse en cours...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-slate-300 italic">
                &ldquo;{analysis}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <ShieldCheck className="text-brand-orange mb-3" />
                <h4 className="font-semibold text-sm text-slate-200 mb-1">Point positif</h4>
                <p className="text-slate-400 text-sm">{strengthText}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <Zap className="text-brand-orange mb-3" />
                <h4 className="font-semibold text-sm text-slate-200 mb-1">Priorité</h4>
                <p className="text-slate-400 text-sm">
                  {priorityHint ?? 'Consolider vos réflexes de sécurité au quotidien.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
