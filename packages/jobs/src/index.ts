/**
 * @launchkit/jobs
 *
 * Background job definitions powered by Trigger.dev.
 * Each task is a self-contained unit with retry logic and proper error handling.
 *
 * Setup:
 *   1. Add TRIGGER_SECRET_KEY to .env.local
 *   2. Run `pnpm --filter @launchkit/jobs dev` to connect to Trigger.dev
 *   3. Trigger jobs from your API routes or webhook handlers
 *
 * @see https://trigger.dev/docs
 */

// Email jobs
export { sendWelcomeEmail } from "./tasks/send-welcome-email";
export type { SendWelcomeEmailPayload } from "./tasks/send-welcome-email";

export { sendTeamInvite } from "./tasks/send-team-invite";
export type { SendTeamInvitePayload } from "./tasks/send-team-invite";

// Billing jobs
export { syncBillingSeats } from "./tasks/sync-billing-seats";
export type { SyncBillingSeatsPayload } from "./tasks/sync-billing-seats";

export { resetMonthlyCredits } from "./tasks/reset-monthly-credits";
export type { ResetMonthlyCreditsPayload } from "./tasks/reset-monthly-credits";

// AI / document jobs
export { processDocumentEmbedding } from "./tasks/process-document-embedding";
export type { ProcessDocumentEmbeddingPayload } from "./tasks/process-document-embedding";

// Maintenance jobs
export { cleanupExpiredSessions } from "./tasks/cleanup-expired-sessions";
export type { CleanupExpiredSessionsPayload } from "./tasks/cleanup-expired-sessions";
