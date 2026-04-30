// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { customDomains } from "@launchkit/database";
import { eq, and } from "drizzle-orm";
import { verifyDomain } from "@/lib/custom-domains";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ domainId: string }> }
) {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domainId } = await params;

  const [domain] = await db
    .select()
    .from(customDomains)
    .where(and(eq(customDomains.id, domainId), eq(customDomains.orgId, orgId)))
    .limit(1);

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  if (!domain.verificationToken) {
    return NextResponse.json(
      { error: "No verification token found" },
      { status: 400 }
    );
  }

  // Update status to verifying
  await db
    .update(customDomains)
    .set({ status: "verifying", updatedAt: new Date() })
    .where(eq(customDomains.id, domainId));

  const verified = await verifyDomain(domain.domain, domain.verificationToken);

  const newStatus = verified ? "active" : "failed";
  const sslStatus = verified ? "active" : "pending";

  const [updated] = await db
    .update(customDomains)
    .set({
      status: newStatus,
      sslStatus,
      updatedAt: new Date(),
    })
    .where(eq(customDomains.id, domainId))
    .returning();

  return NextResponse.json({
    domain: updated,
    verified,
    message: verified
      ? "Domain verified successfully"
      : "DNS verification failed. Please check your TXT record and try again.",
  });
}
