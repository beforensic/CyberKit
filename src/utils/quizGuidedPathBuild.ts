export const WEAK_ANSWER_THRESHOLD = 2;

export interface QuestionAnswerMeta {
  id: string;
  label: string;
  themeId: string | null;
  themeTitle: string;
  score: number;
}

export interface GuidedThemeStep {
  themeId: string;
  themeTitle: string;
  averageScore: number;
  weakQuestions: string[];
  stepIndex: number;
}

export function buildGuidedThemeSteps(
  items: QuestionAnswerMeta[],
  maxThemes = 3,
): GuidedThemeStep[] {
  if (items.length === 0) return [];

  const byTheme = new Map<
    string,
    { themeId: string; themeTitle: string; scores: number[]; weakQuestions: string[] }
  >();

  for (const item of items) {
    if (!item.themeId) continue;

    const entry =
      byTheme.get(item.themeId) ??
      { themeId: item.themeId, themeTitle: item.themeTitle, scores: [], weakQuestions: [] };

    entry.scores.push(item.score);
    if (item.score <= WEAK_ANSWER_THRESHOLD) {
      entry.weakQuestions.push(item.label);
    }
    byTheme.set(item.themeId, entry);
  }

  const ranked = [...byTheme.values()]
    .map((theme) => ({
      themeId: theme.themeId,
      themeTitle: theme.themeTitle,
      averageScore:
        theme.scores.reduce((sum, value) => sum + value, 0) / theme.scores.length,
      weakQuestions: theme.weakQuestions.slice(0, 2),
    }))
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, maxThemes);

  return ranked.map((step, index) => ({
    ...step,
    stepIndex: index + 1,
  }));
}
