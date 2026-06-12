import type { QuizQuestion } from '../services/quizQuestions';

/** Filtre optionnel selon le profil choisi sur l'écran d'accueil du quiz. */
export function filterQuestionsByProfile(
  questions: QuizQuestion[],
  profile: string,
): QuizQuestion[] {
  const slugByProfile: Record<string, string[]> = {
    independant: ['commercant', 'independant', 'solo'],
    liberal: ['liberal', 'profession-liberale'],
    tpe: ['tpe-pme', 'tpe', 'pme'],
  };

  const allowed = slugByProfile[profile];
  if (!allowed?.length) return questions;

  const filtered = questions.filter(
    (q) => !q.profileSlug || allowed.includes(q.profileSlug),
  );

  return filtered.length > 0 ? filtered : questions;
}
