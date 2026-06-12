import { describe, expect, it } from 'vitest';
import { filterQuestionsByProfile } from './quizProfileFilter';
import type { QuizQuestion } from '../services/quizQuestions';

const questions: QuizQuestion[] = [
  { id: '1', label: 'Q générique', themeTitle: 'Thème', profileSlug: null },
  { id: '2', label: 'Q indépendant', themeTitle: 'Thème', profileSlug: 'independant' },
  { id: '3', label: 'Q TPE', themeTitle: 'Thème', profileSlug: 'tpe' },
  { id: '4', label: 'Q libéral', themeTitle: 'Thème', profileSlug: 'liberal' },
];

describe('filterQuestionsByProfile', () => {
  it('keeps generic questions for every profile', () => {
    const filtered = filterQuestionsByProfile(questions, 'independant');
    expect(filtered.some((q) => q.id === '1')).toBe(true);
    expect(filtered.some((q) => q.id === '2')).toBe(true);
    expect(filtered.some((q) => q.id === '3')).toBe(false);
  });

  it('falls back to all questions when filter would be empty', () => {
    const onlyTpe = questions.filter((q) => q.profileSlug === 'tpe');
    expect(filterQuestionsByProfile(onlyTpe, 'independant')).toEqual(onlyTpe);
  });

  it('returns all questions for unknown profile key', () => {
    expect(filterQuestionsByProfile(questions, 'unknown')).toEqual(questions);
  });
});
