import { pgTable, text, timestamp, varchar, serial } from "drizzle-orm/pg-core";

export const changelogEntries = pgTable("changelog_entries", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  version: varchar("version", { length: 50 }),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
