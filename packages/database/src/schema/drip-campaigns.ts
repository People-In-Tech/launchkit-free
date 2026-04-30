import { pgTable, text, timestamp, uuid, integer, boolean, index } from "drizzle-orm/pg-core";

export const dripCampaigns = pgTable("drip_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // "Welcome Series", "Trial Expiring", "Re-engagement"
  trigger: text("trigger").notNull(), // "user.created", "trial.expiring", "user.inactive", "subscription.cancelled"
  enabled: boolean("enabled").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dripSteps = pgTable("drip_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull(),
  stepOrder: integer("step_order").notNull(), // 0, 1, 2, 3...
  delayMinutes: integer("delay_minutes").notNull(), // 0 = immediate, 1440 = 1 day, 10080 = 1 week
  subject: text("subject").notNull(),
  templateName: text("template_name").notNull(), // matches email template file name
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("drip_steps_campaign_idx").on(table.campaignId),
]);

export const dripEnrollments = pgTable("drip_enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  campaignId: uuid("campaign_id").notNull(),
  currentStep: integer("current_step").default(0),
  status: text("status").notNull().default("active"), // "active" | "completed" | "paused" | "cancelled"
  nextSendAt: timestamp("next_send_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("drip_enrollments_user_idx").on(table.userId),
  index("drip_enrollments_campaign_idx").on(table.campaignId),
  index("drip_enrollments_status_idx").on(table.status),
  index("drip_enrollments_next_send_idx").on(table.nextSendAt),
]);

export const dripSends = pgTable("drip_sends", {
  id: uuid("id").defaultRandom().primaryKey(),
  enrollmentId: uuid("enrollment_id").notNull(),
  stepId: uuid("step_id").notNull(),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  status: text("status").notNull().default("pending"), // "pending" | "sent" | "failed" | "bounced"
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("drip_sends_enrollment_idx").on(table.enrollmentId),
]);
