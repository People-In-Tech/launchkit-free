// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db, leads } from "@launchkit/database";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email || !email.includes("@")) {
    return new Response(
      `<html><body style="font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center">
        <h2>Invalid unsubscribe link</h2>
        <p>This link appears to be invalid. Please contact hello@getlaunchkit.app if you need help.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" }, status: 400 }
    );
  }

  try {
    await db
      .update(leads)
      .set({ unsubscribed: true })
      .where(eq(leads.email, email.toLowerCase().trim()));
  } catch {
    // Silently succeed even if email not found
  }

  return new Response(
    `<html><body style="font-family:-apple-system,sans-serif;max-width:480px;margin:80px auto;text-align:center;padding:0 20px">
      <h2 style="color:#111827">You're unsubscribed</h2>
      <p style="color:#6b7280">You won't receive any more emails from LaunchKit.</p>
      <p style="margin-top:32px"><a href="https://getlaunchkit.app" style="color:#6366f1;text-decoration:none;font-weight:600">← Back to LaunchKit</a></p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
