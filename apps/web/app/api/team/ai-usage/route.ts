// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { aiUsage } from "@launchkit/database/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

function periodToDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "1d": return new Date(now.getTime() - 86400000);
    case "7d": return new Date(now.getTime() - 7 * 86400000);
    case "30d": return new Date(now.getTime() - 30 * 86400000);
    case "90d": return new Date(now.getTime() - 90 * 86400000);
    default: return new Date(now.getTime() - 7 * 86400000);
  }
}

export async function GET(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "7d";
  const since = periodToDate(period);

  const scope = orgId
    ? eq(aiUsage.orgId, orgId)
    : eq(aiUsage.userId, userId);

  const rows = await db
    .select()
    .from(aiUsage)
    .where(and(scope, gte(aiUsage.createdAt, since)))
    .orderBy(desc(aiUsage.createdAt))
    .limit(200);

  // Summary aggregation
  const totalTokens = rows.reduce((sum, r) => sum + (r.totalTokens ?? 0), 0);
  const totalCost = rows.reduce((sum, r) => sum + (r.costUsd ?? 0), 0);
  const callCount = rows.length;

  // Top model
  const modelCounts: Record<string, number> = {};
  for (const r of rows) {
    modelCounts[r.model] = (modelCounts[r.model] ?? 0) + 1;
  }
  const topModel = Object.entries(modelCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "";

  return NextResponse.json({
    data: rows,
    summary: { totalTokens, totalCost, callCount, topModel },
    period,
  });
}
