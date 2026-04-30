import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const ssoConfigs = pgTable("sso_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: text("org_id").notNull().unique(),
  provider: text("provider").notNull(), // "okta" | "azure-ad" | "google-workspace" | "onelogin" | "custom"
  domain: text("domain").notNull(), // e.g. "acme.com"
  enforceSSO: boolean("enforce_sso").default(false), // force all org users to use SSO
  enabled: boolean("enabled").default(false),
  metadataUrl: text("metadata_url"), // IdP metadata URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
