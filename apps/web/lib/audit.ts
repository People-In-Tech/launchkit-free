// @ts-nocheck
import { db } from "@launchkit/database";
import { auditLogs } from "@launchkit/database";

export async function logAudit(params: {
  userId: string;
  userEmail?: string;
  orgId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  await db.insert(auditLogs).values({
    userId: params.userId,
    userEmail: params.userEmail ?? null,
    orgId: params.orgId ?? null,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId ?? null,
    metadata: params.metadata ?? null,
    ipAddress: params.ipAddress ?? null,
    userAgent: params.userAgent ?? null,
  });
}
