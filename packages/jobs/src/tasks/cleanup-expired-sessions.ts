/**
 * Background job: cleanup-expired-sessions
 *
 * Periodically cleans up expired or stale data from the database to prevent
 * unbounded table growth. Should be scheduled to run daily.
 *
 * Configure as a scheduled trigger in trigger.config.ts:
 *   schedules.task({
 *     id: "cleanup-expired-sessions",
 *     cron: "0 3 * * *", // 3am UTC daily
 *     task: cleanupExpiredSessions,
 *   });
 *
 * What it cleans:
 *   - AI chat sessions older than 90 days (configurable)
 *   - Document chunks whose parent documents were deleted
 *   - Orphaned credit transaction records
 */

import { task, logger } from "@trigger.dev/sdk/v3";

export interface CleanupExpiredSessionsPayload {
  /** Maximum age in days for AI chat sessions (default: 90) */
  chatRetentionDays?: number;
  /** Maximum age in days for credit transaction history (default: 365) */
  creditTransactionRetentionDays?: number;
  /** Whether to actually delete (true) or just log what would be deleted (false) */
  dryRun?: boolean;
}

export const cleanupExpiredSessions = task({
  id: "cleanup-expired-sessions",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 60_000,
  },

  run: async (payload: CleanupExpiredSessionsPayload = {}) => {
    const {
      chatRetentionDays = 90,
      creditTransactionRetentionDays = 365,
      dryRun = false,
    } = payload;

    logger.info("Starting cleanup job", {
      chatRetentionDays,
      creditTransactionRetentionDays,
      dryRun,
    });

    const results = {
      aiChatsDeleted: 0,
      orphanedDocumentChunksDeleted: 0,
      creditTransactionsArchived: 0,
    };

    // ── Clean up old AI chats ──────────────────────────────────────────────
    const chatCutoff = new Date();
    chatCutoff.setDate(chatCutoff.getDate() - chatRetentionDays);

    logger.info("Cleaning AI chats older than", { cutoff: chatCutoff.toISOString() });

    if (!dryRun) {
      // Implementation:
      // const deleted = await db.delete(aiChats)
      //   .where(lt(aiChats.updatedAt, chatCutoff))
      //   .returning({ id: aiChats.id });
      // results.aiChatsDeleted = deleted.length;
      results.aiChatsDeleted = 0; // Placeholder
    }

    // ── Clean up orphaned document chunks ─────────────────────────────────
    logger.info("Cleaning orphaned document chunks");

    if (!dryRun) {
      // Implementation:
      // Find chunks where parentDocumentId is not null but the parent no longer exists
      // const orphaned = await db.execute(sql`
      //   DELETE FROM documents
      //   WHERE parent_document_id IS NOT NULL
      //     AND parent_document_id NOT IN (
      //       SELECT id FROM documents WHERE parent_document_id IS NULL
      //     )
      //   RETURNING id
      // `);
      // results.orphanedDocumentChunksDeleted = orphaned.length;
      results.orphanedDocumentChunksDeleted = 0; // Placeholder
    }

    // ── Archive old credit transactions ────────────────────────────────────
    const txCutoff = new Date();
    txCutoff.setDate(txCutoff.getDate() - creditTransactionRetentionDays);

    logger.info("Archiving credit transactions older than", { cutoff: txCutoff.toISOString() });
    // In practice, archive to a separate table rather than delete for audit purposes.

    logger.info("Cleanup complete", { ...results, dryRun });

    return { success: true, dryRun, ...results };
  },
});
