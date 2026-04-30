import type { AuthAdapter, AuthUser, AuthSession } from '../adapter';

export class SupabaseAuthAdapter implements AuthAdapter {
  async getCurrentUser(): Promise<AuthUser | null> {
    // TODO: Use @supabase/ssr createServerClient
    // const supabase = createServerClient(...)
    // const { data: { user } } = await supabase.auth.getUser()
    return null;
  }

  async getSession(): Promise<AuthSession | null> {
    // TODO: Get Supabase session
    return null;
  }

  async signOut(): Promise<void> {
    // TODO: supabase.auth.signOut()
  }
}
