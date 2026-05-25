import type { Session } from '@supabase/supabase-js';

/** Vérifie le rôle admin tel qu'exposé dans la session client (JWT). */
export function hasAdminRoleInSession(session: Session | null): boolean {
  if (!session?.user) return false;
  const appRole = session.user.app_metadata?.role;
  const userRole = session.user.user_metadata?.role;
  return appRole === 'admin' || userRole === 'admin';
}
