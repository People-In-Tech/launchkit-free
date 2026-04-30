// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { webhookEndpoints, webhookDeliveries } from "@launchkit/database";
import { eq, and } from "drizzle-orm";
import { signPayload } from "@/lib/webhooks";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpointId } = await params;

  const [endpoint] = await db
    .select()
    .from(webhookEndpoints)
    .where(
      and(
        eq(webhookEndpoints.id, endpointId),
        eq(webhookEndpoints.orgId, orgId)
      )
    )
    .limit(1);

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  const testPayload = {
    event: "test.ping",
    timestamp: new Date().toISOString(),
    data: {
      message: "This is a test webhook delivery from LaunchKit.",
    },
  };

  const body = JSON.stringify(testPayload);
  const signature = signPayload(body, endpoint.secret);

  // Record the delivery
  const [delivery] = await db
    .insert(webhookDeliveries)
    .values({
      endpointId: endpoint.id,
      event: "test.ping",
      payload: testPayload,
      attempts: 1,
      maxAttempts: 1,
    })
    .returning();

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": "test.ping",
        "X-Webhook-Delivery": delivery.id,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    const responseBody = await response.text().catch(() => "");

    await db
      .update(webhookDeliveries)
      .set({
        responseStatus: response.status,
        responseBody: responseBody.slice(0, 4096),
        deliveredAt: response.ok ? new Date() : null,
        failedAt: response.ok ? null : new Date(),
      })
      .where(eq(webhookDeliveries.id, delivery.id));

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      deliveryId: delivery.id,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await db
      .update(webhookDeliveries)
      .set({
        responseStatus: 0,
        responseBody: errorMessage,
        failedAt: new Date(),
      })
      .where(eq(webhookDeliveries.id, delivery.id));

    return NextResponse.json({
      success: false,
      status: 0,
      error: errorMessage,
      deliveryId: delivery.id,
    });
  }
}
