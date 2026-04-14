import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Loader, Sparkles } from 'lucide-react';

interface AIAnalysisProps {
  profile: string;
  score: number;
  level: string;
  weakPoints: string[];
}

export interface AIAnalysisRef {
  getAnalysisText: () => string;
}

function sanitizeMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/#{1,6}\s?/g, '')
    .replace(/\n\n+/g, ' ')
    .trim();
}

const AIAnalysis = forwardRef<AIAnalysisRef, AIAnalysisProps>(({ profile, score, level, weakPoints }, ref) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useImperativeHandle(ref, () => ({
    getAnalysisText: () => analysis || ''
  }));

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-analysis`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile,
            score,
            level,
            weakPoints,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }

        const data = await response.json();
        const sanitizedAnalysis = sanitizeMarkdown(data.analysis);
        setAnalysis(sanitizedAnalysis);
      } catch (err) {
        console.error('Error fetching AI analysis:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [profile, score, level, weakPoints]);

  if (error) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-blue-900">
          🤖 Analyse personnalisée
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader className="w-6 h-6 text-blue-600 animate-spin mr-3" />
          <span className="text-blue-700 font-medium">Analyse en cours...</span>
        </div>
      ) : (
        <>
          <p className="text-gray-800 leading-relaxed mb-4" style={{ lineHeight: '1.7' }}>
            {analysis}
          </p>
          <p className="text-xs text-gray-500 italic text-right">
            Analyse générée par intelligence artificielle
          </p>
        </>
      )}
    </div>
  );
});

AIAnalysis.displayName = 'AIAnalysis';

export default AIAnalysis;
