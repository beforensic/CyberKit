import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AIAnalysisProps {
  score: number;
  answers: Record<string, boolean>;
  profileName: string;
}

export default function AIAnalysis({ score, answers, profileName }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAnalysis();
  }, [score, profileName]);

  const generateAnalysis = async () => {
    try {
      setLoading(true);
      // Appel à ta Edge Function Supabase que nous avons configurée (chat-assistant)
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          systemPrompt: `Tu es un expert en cybersécurité pour TPE et Indépendants en Belgique. 
          Analyse les résultats d'un quiz de maturité numérique.
          Profil: ${profileName}
          Score: ${score}/100.
          Rédige un rapport ultra-concis (3 points clés) avec un ton rassurant mais pro.`,
          messages: [
            { role: 'user', content: `Génère mon analyse personnalisée basée sur mon score de ${score}%.` }
          ]
        }
      });

      if (error) throw error;
      setAnalysis(data.message);
    } catch (err) {
      console.error("Erreur IA:", err);
      setAnalysis("L'analyse IA est momentanément indisponible, mais vos résultats indiquent que vous devriez prioriser la sécurisation de vos sauvegardes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden text-left shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <BrainCircuit size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-500 p-3 rounded-2xl animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Analyse Stratégique par IA</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-slate-400 font-bold animate-pulse text-center">
              Génération de votre rapport personnalisé en cours...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-slate-300 italic">
                "{analysis}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <ShieldCheck className="text-orange-500 mb-3" />
                <h4 className="font-black text-sm uppercase tracking-wider mb-1">Point Fort</h4>
                <p className="text-slate-400 text-sm">Votre conscience des risques est élevée.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <Zap className="text-orange-500 mb-3" />
                <h4 className="font-black text-sm uppercase tracking-wider mb-1">Priorité</h4>
                <p className="text-slate-400 text-sm">Action immédiate requise sur vos mots de passe.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}