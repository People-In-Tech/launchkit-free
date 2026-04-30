// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { auditLogs } from "@launchkit/database";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export async function GET(request: Request) {
  const { sessionClaims } = await auth();

  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const userId = url.searchParams.get("userId");
  const resource = url.searchParams.get("resource");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)));
  const format = url.searchParams.get("format");

  const conditions: SQL[] = [];
  if (action) conditions.push(eq(auditLogs.action, action));
  if (userId) conditions.push(eq(auditLogs.userId, userId));
  if (resource) conditions.push(eq(auditLogs.resource, resource));
  if (startDate) conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
  if (endDate) conditions.push(lte(auditLogs.createdAt, new Date(endDate)));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  if (format === "csv") {
    const allLogs = await db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt));

    const header = "id,timestamp,user_id,user_email,action,resource,resource_id,ip_address,metadata\n";
    const rows = allLogs.map((log) =>
      [
        log.id,
        log.createdAt.toISOString(),
        log.userId,
        log.userEmail ?? "",
        log.action,
        log.resource,
        log.resourceId ?? "",
        log.ipAddress ?? "",
        log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : "",
      ]
        .map((v) => `"${v}"`)
        .join(",")
    );

    return new Response(header + rows.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit-logs.csv"`,
      },
    });
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(where);

  const logs = await db
    .select()
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return NextResponse.json({
    logs,
    total: Number(countResult.count),
    page,
    limit,
  });
}
