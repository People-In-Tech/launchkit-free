export * from "./schema";
export * from "./client";
export type * from "./types";
export type { DatabaseAdapter } from "./adapter";
export { NeonAdapter } from "./adapters/neon";
export { SupabaseAdapter } from "./adapters/supabase";
export { FirebaseAdapter } from "./adapters/firebase";
export { createDatabaseAdapter } from "./adapters";

// Re-export common drizzle-orm functions to prevent dual-instance errors in consumers
export * from "drizzle-orm";
