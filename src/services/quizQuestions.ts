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

/** Filtre optionnel selon le profil choisi sur l’écran d’accueil du quiz. */
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
