import { pgTable, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";

export const featureFlags = pgTable("feature_flags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(false),
  enabledForPlans: text("enabled_for_plans").array(),
  enabledForOrgs: text("enabled_for_orgs").array(),
  rolloutPercentage: integer("rollout_percentage").notNull().default(100),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});
