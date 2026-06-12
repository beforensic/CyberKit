/** Incrémenter si le prompt ou le format de réponse IA change. */
const CACHE_VERSION = 'v1';

const STORAGE_PREFIX = 'cyberkit_ai_analysis:';

export interface CachedAiAnalysis {
  analysis: string;
  priorityHint: string | null;
}

function answersFingerprint(answers: Record<string, number>): string {
  return Object.entries(answers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, value]) => `${id}:${value}`)
    .join(',');
}

export function buildAiAnalysisCacheKey(
  profileName: string,
  score: number,
  answers: Record<string, number>,
): string {
  return `${CACHE_VERSION}:${profileName}:${score}:${answersFingerprint(answers)}`;
}

function storageKey(cacheKey: string): string {
  return `${STORAGE_PREFIX}${cacheKey}`;
}

export function getCachedAiAnalysis(cacheKey: string): CachedAiAnalysis | null {
  try {
    const raw = sessionStorage.getItem(storageKey(cacheKey));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedAiAnalysis;
    if (typeof parsed.analysis !== 'string' || !parsed.analysis.trim()) {
      return null;
    }

    return {
      analysis: parsed.analysis,
      priorityHint:
        typeof parsed.priorityHint === 'string' ? parsed.priorityHint : null,
    };
  } catch {
    return null;
  }
}

export function setCachedAiAnalysis(cacheKey: string, data: CachedAiAnalysis): void {
  try {
    sessionStorage.setItem(storageKey(cacheKey), JSON.stringify(data));
  } catch {
    // Quota dépassé ou navigation privée : ignorer silencieusement
  }
}
