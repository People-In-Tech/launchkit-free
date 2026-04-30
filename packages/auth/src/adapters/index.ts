import type { AuthAdapter } from '../adapter';
import type { AuthProvider } from '@launchkit/config';

export function createAuthAdapter(provider: AuthProvider): AuthAdapter {
  switch (provider) {
    case 'clerk': {
      const { ClerkAuthAdapter } = require('./clerk');
      return new ClerkAuthAdapter();
    }
    case 'supabase': {
      const { SupabaseAuthAdapter } = require('./supabase');
      return new SupabaseAuthAdapter();
    }
    case 'nextauth': {
      const { NextAuthAdapter } = require('./nextauth');
      return new NextAuthAdapter();
    }
    default:
      throw new Error(`Unsupported auth provider: ${provider}`);
  }
}
