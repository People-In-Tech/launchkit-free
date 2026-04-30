import { pgTable, text, timestamp, uuid, boolean, jsonb, integer } from "drizzle-orm/pg-core";

export const onboardingProgress = pgTable("onboarding_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
  currentStep: integer("current_step").default(0),
  completedSteps: jsonb("completed_steps").$type<string[]>().default([]),
  stackChoices: jsonb("stack_choices").$type<Record<string, string>>().default({}),
  projectDescription: text("project_description"),
  aiRecommendations: jsonb("ai_recommendations").$type<Record<string, string>>(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const onboardingMessages = pgTable("onboarding_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  step: text("step"), // which onboarding step this relates to
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
