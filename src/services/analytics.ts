import { supabase } from '../lib/supabase';

export async function trackDiagnosticCompletion(score: number, profileType: string): Promise<void> {
  try {
    const { error } = await supabase.from('diagnostic_completions').insert({
      score,
      profile_type: profileType,
    });
    if (error) {
      console.warn('[analytics] diagnostic insert failed:', error.message);
    }
  } catch {
    // Analytics must not block the user flow
  }
}

export async function trackResourceView(resourceId: string, resourceType: string): Promise<void> {
  try {
    const { error } = await supabase.from('resource_views').insert({
      resource_id: resourceId,
      resource_type: resourceType,
    });
    if (error) {
      console.warn('[analytics] resource view insert failed:', error.message);
    }
  } catch {
    // Analytics must not block the user flow
  }
}

export async function trackSearchQuery(query: string, resultsCount: number): Promise<void> {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return;

  try {
    const { error } = await supabase.from('search_queries').insert({
      query: normalized,
      results_count: resultsCount,
    });
    if (error) {
      console.warn('[analytics] search insert failed:', error.message);
    }
  } catch {
    // Analytics must not block the user flow
  }
}
