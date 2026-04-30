// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createBillingAdapter } from "@launchkit/billing";
import { db } from "@launchkit/database";
import { organizations } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { absoluteUrl } from "@/lib/utils";

export async function POST() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });

  if (!org?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 });
  }

  const billing = createBillingAdapter();

  const result = await billing.createPortal({
    customerId: org.stripeCustomerId,
    returnUrl: absoluteUrl("/settings/billing"),
  });

  return NextResponse.json({ url: result.url });
}
