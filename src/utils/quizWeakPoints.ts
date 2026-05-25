import { supabase } from '../lib/supabase';

const WEAK_ANSWER_THRESHOLD = 2;

export async function getQuizWeakPoints(
  answers: Record<string, number>,
  maxPoints = 3,
): Promise<string[]> {
  const ids = Object.keys(answers);
  if (ids.length === 0) {
    return ['Renforcer vos pratiques de cybersécurité au quotidien'];
  }

  const { data, error } = await supabase
    .from('questions')
    .select('id, label:text')
    .in('id', ids);

  if (error || !data?.length) {
    return ['Renforcer vos pratiques de cybersécurité au quotidien'];
  }

  const weakPoints = data
    .map((q) => ({
      label: typeof q.label === 'string' && q.label.trim() ? q.label.trim() : 'Point à améliorer',
      value: answers[q.id as string] ?? 5,
    }))
    .filter((q) => q.value <= WEAK_ANSWER_THRESHOLD)
    .sort((a, b) => a.value - b.value)
    .slice(0, maxPoints)
    .map((q) => q.label);

  if (weakPoints.length > 0) return weakPoints;

  return ['Poursuivre vos bonnes habitudes et rester vigilant face aux nouvelles menaces'];
}
