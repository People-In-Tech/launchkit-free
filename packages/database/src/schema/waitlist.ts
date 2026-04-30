import { pgTable, text, timestamp, integer, varchar, serial } from "drizzle-orm/pg-core";

export const waitlistEntries = pgTable("waitlist_entries", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  referralCode: varchar("referral_code", { length: 50 }).notNull().unique(),
  referredBy: varchar("referred_by", { length: 50 }),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
