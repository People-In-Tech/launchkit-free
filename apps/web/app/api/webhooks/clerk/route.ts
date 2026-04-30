// @ts-nocheck
/**
 * Clerk → Database sync webhook.
 *
 * Mirrors users, organizations, and organization memberships from Clerk into
 * the `lk_users`, `lk_organizations`, and `lk_organization_memberships`
 * tables so server-side queries (billing, referrals, audit logs, etc.) can
 * join on user_id / org_id.
 *
 * Set up:
 *   1. Clerk dashboard → Webhooks → Add Endpoint
 *      URL: https://<your-domain>/api/webhooks/clerk
 *      Events: user.created, user.updated, user.deleted,
 *              organization.created, organization.updated, organization.deleted,
 *              organizationMembership.created, organizationMembership.updated,
 *              organizationMembership.deleted
 *   2. Copy the Signing Secret → set CLERK_WEBHOOK_SECRET in Vercel.
 */
export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@launchkit/database";
import {
  users,
  organizations,
  organizationMemberships,
} from "@launchkit/database";
import { eq, and } from "drizzle-orm";

type ClerkEmailAddress = { id: string; email_address: string };

type ClerkUserPayload = {
  id: string;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
};

type ClerkOrganizationPayload = {
  id: string;
  name: string;
  slug?: string | null;
  image_url?: string | null;
  created_by?: string | null;
};

type ClerkMembershipPayload = {
  organization: { id: string };
  public_user_data: { user_id: string };
  role: string;
};

type ClerkEvent =
  | { type: "user.created" | "user.updated"; data: ClerkUserPayload }
  | { type: "user.deleted"; data: { id: string; deleted?: boolean } }
  | {
      type: "organization.created" | "organization.updated";
      data: ClerkOrganizationPayload;
    }
  | { type: "organization.deleted"; data: { id: string; deleted?: boolean } }
  | {
      type:
        | "organizationMembership.created"
        | "organizationMembership.updated";
      data: ClerkMembershipPayload;
    }
  | {
      type: "organizationMembership.deleted";
      data: ClerkMembershipPayload;
    };

function primaryEmail(payload: ClerkUserPayload): string | null {
  if (!payload.email_addresses || payload.email_addresses.length === 0) {
    return null;
  }
  const primary = payload.email_addresses.find(
    (e) => e.id === payload.primary_email_address_id
  );
  return (primary ?? payload.email_addresses[0]).email_address;
}

function mapClerkRole(role: string): "owner" | "admin" | "member" {
  // Clerk sends roles like "org:admin", "org:member", "admin", "member"
  const normalized = role.replace(/^org:/, "").toLowerCase();
  if (normalized === "admin") return "admin";
  if (normalized === "owner" || normalized === "creator") return "owner";
  return "member";
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Clerk Webhook] CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const payload = await req.text();
  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix signature headers" },
      { status: 400 }
    );
  }

  let event: ClerkEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("[Clerk Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const u = event.data;
        const email = primaryEmail(u);
        if (!email) {
          console.warn(`[Clerk Webhook] ${event.type} ${u.id} has no email — skipping`);
          return NextResponse.json({ received: true });
        }

        await db
          .insert(users)
          .values({
            id: u.id,
            email,
            firstName: u.first_name ?? null,
            lastName: u.last_name ?? null,
            imageUrl: u.image_url ?? null,
          })
          .onConflictDoUpdate({
            target: users.id,
            set: {
              email,
              firstName: u.first_name ?? null,
              lastName: u.last_name ?? null,
              imageUrl: u.image_url ?? null,
              updatedAt: new Date(),
            },
          });
        break;
      }

      case "user.deleted": {
        if (!event.data.id) break;
        // Soft-deactivate rather than hard-delete to preserve FK integrity
        // (purchases, audit logs, referrals all reference users.id).
        await db
          .update(users)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(users.id, event.data.id));
        break;
      }

      case "organization.created":
      case "organization.updated": {
        const o = event.data;
        await db
          .insert(organizations)
          .values({
            id: o.id,
            name: o.name,
            slug: o.slug ?? null,
            imageUrl: o.image_url ?? null,
            createdBy: o.created_by ?? null,
          })
          .onConflictDoUpdate({
            target: organizations.id,
            set: {
              name: o.name,
              slug: o.slug ?? null,
              imageUrl: o.image_url ?? null,
              updatedAt: new Date(),
            },
          });
        break;
      }

      case "organization.deleted": {
        if (!event.data.id) break;
        // Cascade deletes memberships; subscriptions remain for audit.
        await db.delete(organizations).where(eq(organizations.id, event.data.id));
        break;
      }

      case "organizationMembership.created":
      case "organizationMembership.updated": {
        const m = event.data;
        const orgId = m.organization.id;
        const userId = m.public_user_data.user_id;
        const role = mapClerkRole(m.role);

        await db
          .insert(organizationMemberships)
          .values({ organizationId: orgId, userId, role })
          .onConflictDoUpdate({
            target: [
              organizationMemberships.organizationId,
              organizationMemberships.userId,
            ],
            set: { role },
          });
        break;
      }

      case "organizationMembership.deleted": {
        const m = event.data;
        await db
          .delete(organizationMemberships)
          .where(
            and(
              eq(organizationMemberships.organizationId, m.organization.id),
              eq(
                organizationMemberships.userId,
                m.public_user_data.user_id
              )
            )
          );
        break;
      }

      default: {
        // Unhandled event types (e.g. session.*, email.*) — ignore.
        console.log(`[Clerk Webhook] Ignored event: ${(event as { type: string }).type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Clerk Webhook] Handler error:", err);
    // Return 500 so Clerk retries. svix/Clerk exponential-backoff the retry.
    return NextResponse.json(
      { error: "Handler error" },
      { status: 500 }
    );
  }
}
