import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, index, decimal } from "drizzle-orm/pg-core";

export const referralCodes = pgTable("referral_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(), // one code per user
  code: text("code").notNull().unique(), // "CALEB2025", auto-generated or custom
  clicks: integer("clicks").default(0),
  signups: integer("signups").default(0),
  conversions: integer("conversions").default(0), // signups that became paid
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("referral_codes_user_idx").on(table.userId),
  index("referral_codes_code_idx").on(table.code),
]);

export const referralEvents = pgTable("referral_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  referralCodeId: uuid("referral_code_id").notNull(),
  referrerId: text("referrer_id").notNull(),
  referredUserId: text("referred_user_id"),
  referredEmail: text("referred_email"),
  type: text("type").notNull(), // "click" | "signup" | "conversion"
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }),
  rewardStatus: text("reward_status").default("pending"), // "pending" | "approved" | "paid" | "rejected"
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("referral_events_code_idx").on(table.referralCodeId),
  index("referral_events_referrer_idx").on(table.referrerId),
  index("referral_events_type_idx").on(table.type),
]);

export const referralTiers = pgTable("referral_tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // "Bronze", "Silver", "Gold"
  minReferrals: integer("min_referrals").notNull(), // 1, 5, 20
  rewardType: text("reward_type").notNull(), // "percentage" | "fixed" | "credit"
  rewardValue: decimal("reward_value", { precision: 10, scale: 2 }).notNull(), // 10 (= 10% or $10)
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
