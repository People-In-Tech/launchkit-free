// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { webhookEndpoints } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const endpoints = await db
    .select()
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.orgId, orgId))
    .orderBy(webhookEndpoints.createdAt);

  return NextResponse.json({ endpoints });
}

export async function POST(req: Request) {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, events, description } = (await req.json()) as {
    url: string;
    events: string[];
    description?: string;
  };

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!events || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json(
      { error: "At least one event is required" },
      { status: 400 }
    );
  }

  const secret = `whsec_${randomBytes(32).toString("hex")}`;

  const [endpoint] = await db
    .insert(webhookEndpoints)
    .values({
      orgId,
      url,
      secret,
      events,
      description: description || null,
    })
    .returning();

  return NextResponse.json({ endpoint }, { status: 201 });
}
