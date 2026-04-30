// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { ssoConfigs } from "@launchkit/database";
import { eq } from "drizzle-orm";

export async function GET() {
  const { orgId, sessionClaims } = await auth();

  if (!orgId || sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [config] = await db
    .select()
    .from(ssoConfigs)
    .where(eq(ssoConfigs.orgId, orgId));

  return NextResponse.json(config ?? null);
}

export async function POST(request: Request) {
  const { orgId, sessionClaims } = await auth();

  if (!orgId || sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { provider, domain, metadataUrl, enforceSSO, enabled } = body;

  if (!provider || !domain) {
    return NextResponse.json({ error: "provider and domain are required" }, { status: 400 });
  }

  // Upsert: insert or update on conflict
  const [config] = await db
    .insert(ssoConfigs)
    .values({
      orgId,
      provider,
      domain,
      metadataUrl: metadataUrl ?? null,
      enforceSSO: enforceSSO ?? false,
      enabled: enabled ?? false,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: ssoConfigs.orgId,
      set: {
        provider,
        domain,
        metadataUrl: metadataUrl ?? null,
        enforceSSO: enforceSSO ?? false,
        enabled: enabled ?? false,
        updatedAt: new Date(),
      },
    })
    .returning();

  return NextResponse.json(config);
}
