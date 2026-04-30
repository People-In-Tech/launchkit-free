// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { customDomains } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { generateVerificationToken } from "@/lib/custom-domains";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const domains = await db
    .select()
    .from(customDomains)
    .where(eq(customDomains.orgId, orgId))
    .orderBy(customDomains.createdAt);

  return NextResponse.json({ domains });
}

export async function POST(req: Request) {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain } = (await req.json()) as { domain: string };

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  // Basic domain validation
  const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  const verificationToken = generateVerificationToken();

  try {
    const [created] = await db
      .insert(customDomains)
      .values({
        orgId,
        domain: domain.toLowerCase(),
        status: "pending",
        verificationToken,
      })
      .returning();

    return NextResponse.json({ domain: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "Domain already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to add domain" }, { status: 500 });
  }
}
