const SCORE_KEY = 'cyberkit_last_score';

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