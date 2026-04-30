import { pgTable, text, timestamp, varchar, serial, boolean, integer } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  source: varchar("source", { length: 100 }).notNull().default("unknown"),
  page: varchar("page", { length: 255 }),
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  convertedAt: timestamp("converted_at"), // filled when they actually buy
  emailSentAt: timestamp("email_sent_at"),   // when first (lead magnet) email was sent
  sequenceStep: integer("sequence_step").notNull().default(0), // 0=lead magnet sent, 1=day2, 2=day5, 3=day9 (complete)
  unsubscribed: boolean("unsubscribed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
