import { sql } from 'drizzle-orm';
import { getDb } from '../client';
import type { DatabaseAdapter } from '../adapter';

export class NeonAdapter implements DatabaseAdapter {
  getClient() {
    return getDb();
  }

  async healthCheck() {
    try {
      const db = getDb();
      await db.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }
}
