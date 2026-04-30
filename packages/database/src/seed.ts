import { db } from "./client";
import { users, organizations, organizationMemberships, subscriptions, userCredits } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const [demoUser] = await db.insert(users).values({
    id: "user_demo_001",
    email: "demo@launchkit.dev",
    firstName: "Demo",
    lastName: "User",
    role: "super_admin",
  }).onConflictDoNothing().returning();

  console.log("✅ Created demo user:", demoUser?.email);

  // Create demo org
  const [demoOrg] = await db.insert(organizations).values({
    id: "org_demo_001",
    name: "Demo Organization",
    slug: "demo-org",
    createdBy: "user_demo_001",
  }).onConflictDoNothing().returning();

  console.log("✅ Created demo organization:", demoOrg?.name);

  // Add user to org
  await db.insert(organizationMemberships).values({
    organizationId: "org_demo_001",
    userId: "user_demo_001",
    role: "owner",
  }).onConflictDoNothing();

  // Create subscription
  await db.insert(subscriptions).values({
    id: "sub_demo_001",
    organizationId: "org_demo_001",
    status: "active",
    plan: "pro",
    interval: "month",
  }).onConflictDoNothing();

  // Add credits
  await db.insert(userCredits).values({
    userId: "user_demo_001",
    balance: 1000,
    totalUsed: 0,
  }).onConflictDoNothing();

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
