import { describe, expect, it } from 'vitest';
import { buildGuidedThemeSteps, type QuestionAnswerMeta } from './quizGuidedPathBuild';

describe('buildGuidedThemeSteps', () => {
  const items: QuestionAnswerMeta[] = [
    { id: '1', label: 'Q1 faible', themeId: 'theme-a', themeTitle: 'Mots de passe', score: 1 },
    { id: '2', label: 'Q2 faible', themeId: 'theme-a', themeTitle: 'Mots de passe', score: 2 },
    { id: '3', label: 'Q3 ok', themeId: 'theme-b', themeTitle: 'Sauvegardes', score: 4 },
    { id: '4', label: 'Q4 moyen', themeId: 'theme-c', themeTitle: 'Phishing', score: 3 },
    { id: '5', label: 'Sans thème', themeId: null, themeTitle: 'Général', score: 1 },
  ];

  it('prioritises themes with the lowest average score', () => {
    const steps = buildGuidedThemeSteps(items, 3);
    expect(steps.map((s) => s.themeTitle)).toEqual([
      'Mots de passe',
      'Phishing',
      'Sauvegardes',
    ]);
  });

  it('includes weak question labels per theme', () => {
    const steps = buildGuidedThemeSteps(items, 1);
    expect(steps[0]?.weakQuestions).toEqual(['Q1 faible', 'Q2 faible']);
    expect(steps[0]?.stepIndex).toBe(1);
  });

  it('returns empty array when no themed answers exist', () => {
    expect(
      buildGuidedThemeSteps(
        [{ id: 'x', label: 'Q', themeId: null, themeTitle: 'Général', score: 1 }],
        3,
      ),
    ).toEqual([]);
  });
});
