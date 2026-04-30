import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Get the read replica database URL for a specific region.
 * Uses environment variables in the format NEON_READ_REPLICA_{REGION}_URL.
 *
 * Example env vars:
 *   NEON_READ_REPLICA_IAD1_URL=postgresql://...
 *   NEON_READ_REPLICA_SFO1_URL=postgresql://...
 *   NEON_READ_REPLICA_LHR1_URL=postgresql://...
 */
export function getReadReplicaUrl(region: string): string | null {
  const envKey = `NEON_READ_REPLICA_${region.toUpperCase().replace("-", "_")}_URL`;
  return process.env[envKey] || null;
}

/**
 * Create a Drizzle database client connected to a region-specific read replica.
 * Falls back to the primary DATABASE_URL if no regional replica is configured.
 */
export function createRegionalClient(region: string) {
  const replicaUrl = getReadReplicaUrl(region);
  const connectionUrl = replicaUrl || process.env.DATABASE_URL;

  if (!connectionUrl) {
    throw new Error(
      `No database URL found for region "${region}" (checked ${`NEON_READ_REPLICA_${region.toUpperCase()}_URL`} and DATABASE_URL)`
    );
  }

  const sql = neon(connectionUrl);
  return drizzle(sql, { schema });
}
