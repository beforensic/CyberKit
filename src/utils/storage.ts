import { ScoreResult } from '../types';

const SCORE_KEY = 'securicoach_score';
const THEME_KEY = 'securicoach_theme_interest';
const FAVORITES_KEY = 'securicoach_favorites';

export const saveScore = (scoreResult: ScoreResult): void => {
  localStorage.setItem(SCORE_KEY, JSON.stringify(scoreResult));
};

export const getScore = (): ScoreResult | null => {
  const stored = localStorage.getItem(SCORE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const clearScore = (): void => {
  localStorage.removeItem(SCORE_KEY);
};

export const saveThemeInterest = (themeName: string): void => {
  localStorage.setItem(THEME_KEY, themeName);
};

export const getThemeInterest = (): string | null => {
  return localStorage.getItem(THEME_KEY);
};

export const clearThemeInterest = (): void => {
  localStorage.removeItem(THEME_KEY);
};

export const getFavorites = (): string[] => {
  const stored = localStorage.getItem(FAVORITES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveFavorites = (favorites: string[]): void => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const addFavorite = (resourceId: string): void => {
  const favorites = getFavorites();
  if (!favorites.includes(resourceId)) {
    saveFavorites([...favorites, resourceId]);
  }
};

export const removeFavorite = (resourceId: string): void => {
  const favorites = getFavorites();
  saveFavorites(favorites.filter(id => id !== resourceId));
};

export const toggleFavorite = (resourceId: string): boolean => {
  const favorites = getFavorites();
  if (favorites.includes(resourceId)) {
    removeFavorite(resourceId);
    return false;
  } else {
    addFavorite(resourceId);
    return true;
  }
};

export const clearAllFavorites = (): void => {
  localStorage.removeItem(FAVORITES_KEY);
};
