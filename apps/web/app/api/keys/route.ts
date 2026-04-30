// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { apiKeys } from "@launchkit/database";
import { eq, desc } from "drizzle-orm";
import { generateApiKey } from "@/lib/api-keys";

export async function GET() {
  const { orgId } = await auth();

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      rateLimit: apiKeys.rateLimit,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      revoked: apiKeys.revoked,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.orgId, orgId))
    .orderBy(desc(apiKeys.createdAt));

  return NextResponse.json(keys);
}

export async function POST(request: Request) {
  const { orgId, userId } = await auth();

  if (!orgId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, scopes, rateLimit, expiresAt } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { key, hash, prefix } = generateApiKey();

  const [created] = await db
    .insert(apiKeys)
    .values({
      orgId,
      userId,
      name,
      keyPrefix: prefix,
      keyHash: hash,
      scopes: scopes ?? ["read"],
      rateLimit: rateLimit ?? 1000,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .returning();

  // Return the full key only this once
  return NextResponse.json(
    {
      id: created.id,
      name: created.name,
      keyPrefix: created.keyPrefix,
      scopes: created.scopes,
      rateLimit: created.rateLimit,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
      key, // Only returned at creation time
    },
    { status: 201 }
  );
}
