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

export function calculateQuizScore(
  answers: Record<string, number>,
  maxScorePerQuestion = 5,
): number {
  const values = Object.values(answers);
  if (values.length === 0) return 0;

  const totalScore = values.reduce((sum, value) => sum + value, 0);
  const maxScore = values.length * maxScorePerQuestion;
  return Math.round((totalScore / maxScore) * 100);
}

export const getScoreLevel = (score: number): { label: string; description: string } => {
  if (score < 50) return { label: 'À renforcer', description: 'Des actions prioritaires sont recommandées.' };
  if (score < 70) return { label: 'En progression', description: 'Vous avez de bonnes bases à consolider.' };
  if (score < 90) return { label: 'Bien protégé', description: 'Votre niveau de sécurité est satisfaisant.' };
  return { label: 'Excellent', description: 'Votre maturité cybersécurité est remarquable.' };
};

/** Couleurs du score alignées sur la marque (rouge uniquement si critique). */
export const getScoreDisplayStyles = (score: number): { text: string; ring: string } => {
  if (score < 50) return { text: 'text-red-400', ring: 'border-red-400/90' };
  if (score < 70) return { text: 'text-brand-orange-300', ring: 'border-brand-orange-300' };
  if (score < 90) return { text: 'text-brand-orange', ring: 'border-brand-orange' };
  return { text: 'text-brand-orange-400', ring: 'border-brand-orange-400' };
};
