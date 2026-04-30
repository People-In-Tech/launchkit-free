import type { AuthAdapter, AuthUser, AuthSession } from '../adapter';

export class NextAuthAdapter implements AuthAdapter {
  async getCurrentUser(): Promise<AuthUser | null> {
    // TODO: Use next-auth getServerSession
    // const session = await getServerSession(authOptions)
    return null;
  }

  async getSession(): Promise<AuthSession | null> {
    // TODO: Get NextAuth session
    return null;
  }

  async signOut(): Promise<void> {
    // TODO: signOut() from next-auth/react
  }
}
