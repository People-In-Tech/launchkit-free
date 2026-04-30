import type { DatabaseAdapter } from '../adapter';
import type { DatabaseProvider } from '@launchkit/config';

export function createDatabaseAdapter(provider: DatabaseProvider): DatabaseAdapter {
  switch (provider) {
    case 'neon': {
      const { NeonAdapter } = require('./neon');
      return new NeonAdapter();
    }
    case 'supabase': {
      const { SupabaseAdapter } = require('./supabase');
      return new SupabaseAdapter();
    }
    case 'firebase': {
      const { FirebaseAdapter } = require('./firebase');
      return new FirebaseAdapter();
    }
    default:
      throw new Error(`Unsupported database provider: ${provider}`);
  }
}
