import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

// GET handler: Clerk redirects here after sign-up/sign-in when redirect_url
// was set to /api/billing/checkout?plan=pro|team. If the user is authenticated
// and a valid plan is in the query string, auto-create a Stripe session and
// redirect straight to checkout — zero extra clicks.
export async function GET(req: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan") as "pro" | "team" | null;

  // Not authenticated or no plan — fall back to pricing
  if (!userId || !plan || (plan !== "pro" && plan !== "team")) {
    return NextResponse.redirect(absoluteUrl("/pricing"), { status: 303 });
  }

  const priceId = process.env[PLAN_PRICE_ENV[plan]];
  if (!priceId) {
    return NextResponse.redirect(absoluteUrl("/pricing"), { status: 303 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      metadata: { userId, plan, kind: "launchkit_license" },
      payment_intent_data: {
        metadata: { userId, plan, kind: "launchkit_license" },
      },
      success_url: absoluteUrl("/portal?purchased=1"),
      cancel_url: absoluteUrl("/pricing?canceled=1"),
      allow_promotion_codes: true,
    });
    return NextResponse.redirect(session.url!, { status: 303 });
  } catch {
    return NextResponse.redirect(absoluteUrl("/pricing"), { status: 303 });
  }
}

// LaunchKit's own digital-product checkout. Creates a Stripe one-time
// Checkout Session for the Pro or Teams license. The webhook at
// /api/webhooks/stripe writes the `purchases` row on `checkout.session.completed`.

type Plan = "pro" | "team";

const PLAN_PRICE_ENV: Record<Plan, string> = {
  pro: "STRIPE_PRICE_LAUNCHKIT_PRO",
  team: "STRIPE_PRICE_LAUNCHKIT_TEAM",
};

async function parsePlan(req: Request): Promise<Plan | null> {
  const ct = req.headers.get("content-type") ?? "";
  let raw: string | null = null;
  if (ct.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as { plan?: string };
    raw = body.plan ?? null;
  } else {
    const form = await req.formData();
    const v = form.get("plan");
    raw = typeof v === "string" ? v : null;
  }
  if (raw === "pro" || raw === "team") return raw;
  return null;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await parsePlan(req);
  if (!plan) {
    return NextResponse.json(
      { error: "Invalid plan. Expected 'pro' or 'team'." },
      { status: 400 },
    );
  }

  const priceId = process.env[PLAN_PRICE_ENV[plan]];
  if (!priceId) {
    return NextResponse.json(
      { error: `${PLAN_PRICE_ENV[plan]} is not configured.` },
      { status: 500 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    metadata: { userId, plan, kind: "launchkit_license" },
    payment_intent_data: {
      metadata: { userId, plan, kind: "launchkit_license" },
    },
    success_url: absoluteUrl("/portal?purchased=1"),
    cancel_url: absoluteUrl("/pricing?canceled=1"),
    allow_promotion_codes: true,
  });

  // Track checkout started (server-side PostHog event)
  try {
    const { trackServerEvent } = await import("@/lib/analytics");
    trackServerEvent(userId, "checkout_started", { plan, priceId });
  } catch {
    // analytics is optional — never block checkout
  }

  // Form-encoded callers (the portal Upgrade button) want a 303 redirect.
  // JSON callers (the pricing-page JS) want the URL back.
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.redirect(session.url!, { status: 303 });
  }
  return NextResponse.json({ url: session.url });
}
