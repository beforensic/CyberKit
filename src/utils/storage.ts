/**
 * Utilitaire de stockage local pour CyberKit
 * Gère le score du diagnostic, les favoris et les centres d'intérêt
 */

const SCORE_KEY = 'cyberkit_last_score';
const FAVORITES_KEY = 'cyberkit_favorites';
const INTEREST_KEY = 'cyberkit_theme_interest';

// --- GESTION DU SCORE (QUIZ) ---

export const saveScore = (score: number) => {
  localStorage.setItem(SCORE_KEY, score.toString());
};

export const getScore = (): number | null => {
  const score = localStorage.getItem(SCORE_KEY);
  return score ? parseInt(score, 10) : null;
};

export const clearScore = () => {
  localStorage.removeItem(SCORE_KEY);
};

// --- GESTION DES FAVORIS (RESSOURCES) ---

export const getFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur favorites:', error);
    return [];
  }
};

export const toggleFavorite = (resourceId: string): boolean => {
  try {
    const favorites = getFavorites();
    const index = favorites.indexOf(resourceId);
    let isFavorite = false;

    if (index === -1) {
      favorites.push(resourceId);
      isFavorite = true;
    } else {
      favorites.splice(index, 1);
      isFavorite = false;
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    window.dispatchEvent(new Event('favoritesUpdated'));
    return isFavorite;
  } catch (error) {
    console.error('Erreur toggle favorite:', error);
    return false;
  }
};

// --- GESTION DES INTÉRÊTS (THÉMATIQUES) ---

/**
 * Enregistre quel thème l'utilisateur a consulté
 */
export const saveThemeInterest = (theme: string) => {
  localStorage.setItem(INTEREST_KEY, theme);
};

/**
 * Récupère le dernier thème consulté (utilisé par la page Contact)
 */
export const getThemeInterest = (): string | null => {
  return localStorage.getItem(INTEREST_KEY);
};