import type { AuthAdapter, AuthUser, AuthSession } from '../adapter';

export class ClerkAuthAdapter implements AuthAdapter {
  async getCurrentUser(): Promise<AuthUser | null> {
    const { currentUser } = await import('@clerk/nextjs/server');
    const user = await currentUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? '',
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null,
      imageUrl: user.imageUrl,
      role: 'member',
      createdAt: new Date(user.createdAt),
    };
  }

  async getSession(): Promise<AuthSession | null> {
    const { auth } = await import('@clerk/nextjs/server');
    const session = await auth();
    if (!session.userId) return null;
    return {
      userId: session.userId,
      orgId: session.orgId ?? null,
      role: session.orgRole ?? null,
    };
  }

  async signOut(): Promise<void> {
    // Client-side only — handled by Clerk's SignOutButton
  }
}
