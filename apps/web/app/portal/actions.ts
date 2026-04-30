// @ts-nocheck
"use server";

import { auth } from "@clerk/nextjs/server";
import { db, purchases } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserEntitlement } from "@/lib/entitlement";
import { inviteCollaborator } from "@/lib/github";

export type SubmitGithubResult =
  | { ok: true; invited: boolean; message: string }
  | { ok: false; error: string };

/**
 * Collect the buyer's GitHub username and invite them as a collaborator on
 * the private LaunchKit repo. Security: re-checks entitlement server-side so
 * the form cannot be abused by free users.
 */
export async function submitGithubUsername(
  formData: FormData,
): Promise<SubmitGithubResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Not signed in." };

  const raw = formData.get("githubUsername");
  const username = typeof raw === "string" ? raw.trim() : "";
  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return { ok: false, error: "Enter a valid GitHub username." };
  }

  const entitlement = await getUserEntitlement(userId);
  if (entitlement.plan === "free" || !entitlement.purchase) {
    return { ok: false, error: "This feature requires a paid LaunchKit license." };
  }

  // Idempotent: if we've already invited this username, no-op.
  if (
    entitlement.purchase.githubUsername === username &&
    entitlement.purchase.invitedAt
  ) {
    return {
      ok: true,
      invited: true,
      message: "Invite already sent to your GitHub.",
    };
  }

  // Persist username first so we have a record even if the invite call fails.
  await db
    .update(purchases)
    .set({ githubUsername: username })
    .where(eq(purchases.userId, userId));

  try {
    await inviteCollaborator(username);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send GitHub invite.";
    return { ok: false, error: message };
  }

  await db
    .update(purchases)
    .set({ invitedAt: new Date() })
    .where(eq(purchases.userId, userId));

  revalidatePath("/portal");
  return {
    ok: true,
    invited: true,
    message: `Invite sent to @${username}. Check your GitHub notifications.`,
  };
}
