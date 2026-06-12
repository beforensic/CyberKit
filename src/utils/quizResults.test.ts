import { describe, expect, it, beforeEach } from 'vitest';
import {
  calculateQuizScore,
  getScoreLevel,
  getScoreDisplayStyles,
  saveQuizResults,
  getQuizResults,
  clearQuizResults,
} from './quizResults';

describe('calculateQuizScore', () => {
  it('returns 0 for empty answers', () => {
    expect(calculateQuizScore({})).toBe(0);
  });

  it('computes percentage from answer values', () => {
    expect(calculateQuizScore({ a: 5, b: 5, c: 5 })).toBe(100);
    expect(calculateQuizScore({ a: 1, b: 1, c: 1 })).toBe(20);
    expect(calculateQuizScore({ a: 3, b: 4 })).toBe(70);
  });
});

describe('getScoreLevel', () => {
  it('maps score ranges to labels', () => {
    expect(getScoreLevel(30).label).toBe('À renforcer');
    expect(getScoreLevel(60).label).toBe('En progression');
    expect(getScoreLevel(80).label).toBe('Bien protégé');
    expect(getScoreLevel(95).label).toBe('Excellent');
  });
});

describe('getScoreDisplayStyles', () => {
  it('uses red styling only below 50', () => {
    expect(getScoreDisplayStyles(40).text).toContain('red');
    expect(getScoreDisplayStyles(70).text).toContain('brand-orange');
  });
});

describe('quiz results session storage', () => {
  beforeEach(() => {
    clearQuizResults();
  });

  it('persists and restores quiz results', () => {
    const payload = { score: 72, answers: { q1: 4 }, profile: 'tpe' };
    saveQuizResults(payload);
    expect(getQuizResults()).toEqual(payload);
  });
});
