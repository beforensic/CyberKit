export interface QuizResultData {
  score: number;
  answers: Record<string, number>;
  profile: string;
}

const SESSION_KEY = 'cyberkit_quiz_results';

export const saveQuizResults = (data: QuizResultData) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

export const getQuizResults = (): QuizResultData | null => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const clearQuizResults = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const PROFILE_LABELS: Record<string, string> = {
  independant: 'Indépendant',
  liberal: 'Libéral',
  tpe: 'TPE / PME',
};

export const getScoreLevel = (score: number): { label: string; description: string } => {
  if (score < 50) return { label: 'À renforcer', description: 'Des actions prioritaires sont recommandées.' };
  if (score < 70) return { label: 'En progression', description: 'Vous avez de bonnes bases à consolider.' };
  if (score < 90) return { label: 'Bien protégé', description: 'Votre niveau de sécurité est satisfaisant.' };
  return { label: 'Excellent', description: 'Votre maturité cybersécurité est remarquable.' };
};
