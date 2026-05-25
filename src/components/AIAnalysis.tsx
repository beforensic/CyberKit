import { useState, useEffect, useCallback } from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getScoreLevel } from '../utils/quizResults';
import { getQuizWeakPoints } from '../utils/quizWeakPoints';

interface AIAnalysisProps {
  score: number;
  answers: Record<string, number>;
  profileName: string;
}

export default function AIAnalysis({ score, answers, profileName }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [priorityHint, setPriorityHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const generateAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const level = getScoreLevel(score);
      const weakPoints = await getQuizWeakPoints(answers);
      setPriorityHint(weakPoints[0] ?? null);

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

      setAnalysis(data.analysis ?? null);
    } catch (err) {
      console.error('Erreur IA:', err);
      setAnalysis(
        "L'analyse IA est momentanément indisponible, mais vos résultats indiquent que vous devriez prioriser la sécurisation de vos sauvegardes et de vos mots de passe.",
      );
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
    <div className="mt-12 bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden text-left shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <BrainCircuit size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-orange p-3 rounded-2xl animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Analyse personnalisée</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
            <p className="text-slate-400 font-bold animate-pulse text-center">
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
                <h4 className="font-black text-sm uppercase tracking-wider mb-1">Point positif</h4>
                <p className="text-slate-400 text-sm">{strengthText}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <Zap className="text-brand-orange mb-3" />
                <h4 className="font-black text-sm uppercase tracking-wider mb-1">Priorité</h4>
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
