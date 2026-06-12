import { supabase } from '../lib/supabase';

export interface QuizQuestion {
  id: string;
  label: string;
  themeTitle: string;
  profileSlug: string | null;
}

/**
 * Charge les questions du diagnostic (lecture publique anon).
 * Alias `label:text` : évite les conflits avec la clé JS « text ».
 */
export async function fetchQuizQuestions(): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      label:text,
      theme_id,
      themes ( title ),
      quiz_profiles ( name, slug )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erreur chargement questions:', error);
    throw error;
  }

  return (data ?? []).map((row) => {
    const themes = row.themes as { title?: string } | { title?: string }[] | null;
    const themeTitle = Array.isArray(themes)
      ? themes[0]?.title
      : themes?.title;

    const profile = row.quiz_profiles as { name?: string; slug?: string } | null;

    const label =
      typeof row.label === 'string' && row.label.trim()
        ? row.label.trim()
        : '';

    return {
      id: row.id as string,
      label,
      themeTitle: themeTitle?.trim() || profile?.name?.trim() || 'Cybersécurité',
      profileSlug: profile?.slug ?? null,
    };
  });
}

export { filterQuestionsByProfile } from '../utils/quizProfileFilter';
