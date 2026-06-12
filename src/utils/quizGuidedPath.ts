import { supabase } from '../lib/supabase';
import {
  buildGuidedThemeSteps,
  type GuidedThemeStep,
  type QuestionAnswerMeta,
} from './quizGuidedPathBuild';

export type { GuidedThemeStep, QuestionAnswerMeta } from './quizGuidedPathBuild';
export { buildGuidedThemeSteps } from './quizGuidedPathBuild';

const SESSION_KEY = 'cyberkit_guided_path';

export async function fetchQuestionMetaForAnswers(
  answers: Record<string, number>,
): Promise<QuestionAnswerMeta[]> {
  const ids = Object.keys(answers);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('questions')
    .select('id, label:text, theme_id, themes ( title )')
    .in('id', ids);

  if (error || !data?.length) return [];

  return data.map((row) => {
    const themes = row.themes as { title?: string } | { title?: string }[] | null;
    const themeTitle = Array.isArray(themes) ? themes[0]?.title : themes?.title;

    return {
      id: row.id as string,
      label:
        typeof row.label === 'string' && row.label.trim()
          ? row.label.trim()
          : 'Point à améliorer',
      themeId: (row.theme_id as string | null) ?? null,
      themeTitle: themeTitle?.trim() || 'Cybersécurité',
      score: answers[row.id as string] ?? 5,
    };
  });
}

export async function fetchAndBuildGuidedPath(
  answers: Record<string, number>,
  maxThemes = 3,
): Promise<GuidedThemeStep[]> {
  const meta = await fetchQuestionMetaForAnswers(answers);
  return buildGuidedThemeSteps(meta, maxThemes);
}

export function saveGuidedPath(steps: GuidedThemeStep[]): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(steps));
  } catch {
    // ignore quota errors
  }
}

export function getGuidedPath(): GuidedThemeStep[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuidedThemeStep[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function clearGuidedPath(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export interface GuidedPathProgress {
  steps: GuidedThemeStep[];
  currentIndex: number;
  current: GuidedThemeStep;
  previous: GuidedThemeStep | null;
  next: GuidedThemeStep | null;
  isFirst: boolean;
  isLast: boolean;
}

export function getGuidedPathProgress(themeId: string | null): GuidedPathProgress | null {
  const steps = getGuidedPath();
  if (!steps?.length || !themeId) return null;

  const currentIndex = steps.findIndex(
    (step) => step.themeId.toLowerCase() === themeId.toLowerCase(),
  );
  if (currentIndex === -1) return null;

  const current = steps[currentIndex];

  return {
    steps,
    currentIndex,
    current,
    previous: currentIndex > 0 ? steps[currentIndex - 1] : null,
    next: currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null,
    isFirst: currentIndex === 0,
    isLast: currentIndex === steps.length - 1,
  };
}
