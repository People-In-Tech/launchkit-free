// @ts-nocheck
import { db } from "@launchkit/database";
import { userCredits, creditTransactions } from "@launchkit/database";
import { eq, sql } from "drizzle-orm";

export async function getCredits(userId: string) {
  const result = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId),
  });
  return result?.balance ?? 0;
}

export async function deductCredits(userId: string, amount: number, description?: string) {
  const balance = await getCredits(userId);
  if (balance < amount) {
    throw new Error("Insufficient credits");
  }

  await db
    .update(userCredits)
    .set({
      balance: sql`${userCredits.balance} - ${amount}`,
      totalUsed: sql`${userCredits.totalUsed} + ${amount}`,
    })
    .where(eq(userCredits.userId, userId));

  await db.insert(creditTransactions).values({
    userId,
    amount: -amount,
    type: "usage",
    description: description || "AI usage",
  });

  return balance - amount;
}

export async function addCredits(userId: string, amount: number, type: string, description?: string) {
  // Upsert credits
  const existing = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId),
  });

  if (existing) {
    await db
      .update(userCredits)
      .set({ balance: sql`${userCredits.balance} + ${amount}` })
      .where(eq(userCredits.userId, userId));
  } else {
    await db.insert(userCredits).values({
      userId,
      balance: amount,
    });
  }

  await db.insert(creditTransactions).values({
    userId,
    amount,
    type,
    description: description || `${type} credits`,
  });
}
