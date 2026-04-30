import { pgTable, text, timestamp, uuid, boolean, jsonb, index } from "drizzle-orm/pg-core";

export const seoTemplates = pgTable("seo_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slugPattern: text("slug_pattern").notNull(),
  titleTemplate: text("title_template").notNull(),
  descriptionTemplate: text("description_template").notNull(),
  bodyTemplate: text("body_template").notNull(),
  variables: jsonb("variables").$type<string[]>().notNull(),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seoPages = pgTable("seo_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  body: text("body").notNull(),
  variables: jsonb("variables").$type<Record<string, string>>().notNull(),
  published: boolean("published").default(false),
  seoMetadata: jsonb("seo_metadata").$type<{
    ogImage?: string;
    canonicalUrl?: string;
    structuredData?: Record<string, unknown>;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("seo_pages_slug_idx").on(table.slug),
  index("seo_pages_template_idx").on(table.templateId),
  index("seo_pages_published_idx").on(table.published),
]);
