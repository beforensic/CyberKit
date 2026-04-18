/**
 * Utilitaire de stockage local pour CyberKit
 * Gère le score du diagnostic et les favoris de la bibliothèque
 */

const SCORE_KEY = 'cyberkit_last_score';
const FAVORITES_KEY = 'cyberkit_favorites';

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

/**
 * Récupère la liste des IDs des ressources mises en favoris
 */
export const getFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture des favoris:', error);
    return [];
  }
};

/**
 * Ajoute ou supprime une ressource des favoris
 * @returns true si la ressource est maintenant en favori, false sinon
 */
export const toggleFavorite = (resourceId: string): boolean => {
  try {
    const favorites = getFavorites();
    const index = favorites.indexOf(resourceId);
    let isFavorite = false;

    if (index === -1) {
      // On ajoute
      favorites.push(resourceId);
      isFavorite = true;
    } else {
      // On retire
      favorites.splice(index, 1);
      isFavorite = false;
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

    // On déclenche un événement personnalisé pour prévenir les autres composants
    window.dispatchEvent(new Event('favoritesUpdated'));

    return isFavorite;
  } catch (error) {
    console.error('Erreur lors de la modification des favoris:', error);
    return false;
  }
};