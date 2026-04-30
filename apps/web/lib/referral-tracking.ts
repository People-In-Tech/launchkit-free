// @ts-nocheck
import { db } from "@launchkit/database";
import { referralCodes, referralEvents, referralTiers } from "@launchkit/database";
import { eq, sql, and, desc } from "drizzle-orm";

/**
 * Generate a unique referral code for a user.
 * Creates a random 8-character alphanumeric code.
 */
export async function generateReferralCode(userId: string): Promise<string> {
  // Check if user already has a code
  const existing = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].code;
  }

  const code = generateCode();

  await db.insert(referralCodes).values({
    userId,
    code,
  });

  return code;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Record a click event for a referral code.
 */
export async function trackReferralClick(code: string): Promise<void> {
  const [refCode] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.code, code))
    .limit(1);

  if (!refCode || !refCode.enabled) return;

  await db.insert(referralEvents).values({
    referralCodeId: refCode.id,
    referrerId: refCode.userId,
    type: "click",
  });

  await db
    .update(referralCodes)
    .set({ clicks: sql`${referralCodes.clicks} + 1` })
    .where(eq(referralCodes.id, refCode.id));
}

/**
 * Record a signup event for a referral code.
 */
export async function trackReferralSignup(
  code: string,
  userId: string,
  email?: string
): Promise<void> {
  const [refCode] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.code, code))
    .limit(1);

  if (!refCode || !refCode.enabled) return;

  await db.insert(referralEvents).values({
    referralCodeId: refCode.id,
    referrerId: refCode.userId,
    referredUserId: userId,
    referredEmail: email,
    type: "signup",
  });

  await db
    .update(referralCodes)
    .set({ signups: sql`${referralCodes.signups} + 1` })
    .where(eq(referralCodes.id, refCode.id));
}

/**
 * Record a conversion event (signup became paid).
 */
export async function trackReferralConversion(
  referredUserId: string,
  amount: number
): Promise<void> {
  // Find the signup event for this user
  const [signupEvent] = await db
    .select()
    .from(referralEvents)
    .where(
      and(
        eq(referralEvents.referredUserId, referredUserId),
        eq(referralEvents.type, "signup")
      )
    )
    .limit(1);

  if (!signupEvent) return;

  // Get the referrer's current tier for reward calculation
  const tier = await getUserTier(signupEvent.referrerId);
  const rewardAmount = tier
    ? (amount * Number(tier.rewardValue)) / 100
    : 0;

  await db.insert(referralEvents).values({
    referralCodeId: signupEvent.referralCodeId,
    referrerId: signupEvent.referrerId,
    referredUserId,
    type: "conversion",
    rewardAmount: String(rewardAmount),
    rewardStatus: "pending",
  });

  await db
    .update(referralCodes)
    .set({
      conversions: sql`${referralCodes.conversions} + 1`,
      totalEarnings: sql`${referralCodes.totalEarnings} + ${rewardAmount}`,
    })
    .where(eq(referralCodes.id, signupEvent.referralCodeId));
}

/**
 * Get the current referral tier for a user based on their referral count.
 */
export async function getUserTier(userId: string) {
  const [userCode] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .limit(1);

  if (!userCode) return null;

  const referralCount = userCode.signups ?? 0;

  const tiers = await db
    .select()
    .from(referralTiers)
    .orderBy(desc(referralTiers.minReferrals));

  for (const tier of tiers) {
    if (referralCount >= tier.minReferrals) {
      return tier;
    }
  }

  return null;
}
