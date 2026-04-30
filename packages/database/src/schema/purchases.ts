import { pgTable, text, timestamp, varchar, integer, uuid } from "drizzle-orm/pg-core";

// LaunchKit's OWN digital-product sales (Solo / Teams one-time license).
// This is distinct from `subscriptions` (which is scaffolding for the SaaS
// apps buyers build on top of LaunchKit). Keyed by Clerk userId, one row per
// buyer.
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Clerk user id, no longer unique so they can buy multiple things
  productId: text("product_id").notNull().default("launchkit-pro"),
  productType: varchar("product_type", { length: 20 }).notNull().default("boilerplate"), // boilerplate, plugin, component
  plan: varchar("plan", { length: 20 }).notNull(), // pro, team, or specific tier
  status: varchar("status", { length: 20 }).notNull().default("paid"), // paid, refunded
  stripeCustomerId: text("stripe_customer_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("usd"),
  githubUsername: text("github_username"),
  invitedAt: timestamp("invited_at"),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
});

export type Purchase = typeof purchases.$inferSelect;
