/**
 * Demo seed script — generates realistic fake data when DEMO_MODE=true.
 * Run with: pnpm db:demo
 *
 * Data is deterministic (not random) so it's reproducible.
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (process.env.DEMO_MODE !== 'true') {
  console.log('DEMO_MODE is not enabled. Set DEMO_MODE=true to run the demo seed.');
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// Deterministic data generators
const firstNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank',
  'Ivy', 'Jack', 'Karen', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul',
  'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xander',
  'Yara', 'Zach', 'Amara', 'Blake', 'Clara', 'Derek', 'Elise', 'Felix',
  'Gina', 'Hugo', 'Iris', 'Jake', 'Kira', 'Liam', 'Maya', 'Nate',
  'Opal', 'Pete', 'Rosa', 'Sean', 'Tara', 'Uri', 'Vera', 'Will', 'Xena', 'Yuri',
];

const lastNames = [
  'Anderson', 'Brown', 'Chen', 'Davis', 'Edwards', 'Foster', 'Garcia', 'Harris',
  'Ibrahim', 'Johnson', 'Kim', 'Lee', 'Martinez', 'Nguyen', 'O\'Brien', 'Patel',
  'Quinn', 'Robinson', 'Smith', 'Taylor', 'Underwood', 'Vasquez', 'Williams', 'Xu',
  'Yang', 'Zhang', 'Adams', 'Baker', 'Clark', 'Diaz', 'Evans', 'Fischer',
  'Gonzalez', 'Hill', 'Ito', 'Jones', 'Khan', 'Lopez', 'Moore', 'Nelson',
  'Ortiz', 'Park', 'Reed', 'Scott', 'Thomas', 'Upton', 'Vance', 'White', 'Young', 'Zimmerman',
];

const companyNames = [
  'Acme Corp', 'NovaTech', 'SkylineAI', 'BlueShift Labs', 'PixelForge',
  'CloudNine Studios', 'IronPeak Software', 'Verdant Analytics',
];

function daysAgo(days: number): Date {
  const d = new Date('2026-04-01T12:00:00Z');
  d.setDate(d.getDate() - days);
  return d;
}

async function seed() {
  console.log('Seeding demo data...');

  // Create 50 users
  const userValues = firstNames.map((first, i) => ({
    id: `demo_user_${String(i + 1).padStart(3, '0')}`,
    email: `${first.toLowerCase()}.${lastNames[i]!.toLowerCase().replace("'", '')}@example.com`,
    firstName: first,
    lastName: lastNames[i]!,
    role: i === 0 ? 'super_admin' : 'user',
    isActive: true,
    createdAt: daysAgo(180 - Math.floor((i / 50) * 180)),
    updatedAt: daysAgo(180 - Math.floor((i / 50) * 180)),
  }));

  // Create 8 organizations
  const orgValues = companyNames.map((name, i) => ({
    id: `demo_org_${String(i + 1).padStart(3, '0')}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    createdBy: userValues[i]!.id,
    createdAt: daysAgo(170 - i * 20),
    updatedAt: daysAgo(170 - i * 20),
  }));

  // Create 30 subscriptions across plans and statuses
  const plans = ['free', 'pro', 'team'] as const;
  const statuses = ['active', 'active', 'active', 'active', 'canceled', 'active'] as const;

  const subValues = Array.from({ length: 30 }, (_, i) => {
    const orgIndex = i % orgValues.length;
    const plan = plans[i % plans.length]!;
    const status = statuses[i % statuses.length]!;
    const createdDaysAgo = 180 - Math.floor((i / 30) * 180);
    const created = daysAgo(createdDaysAgo);
    const periodStart = new Date(created);
    const periodEnd = new Date(created);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    return {
      id: `demo_sub_${String(i + 1).padStart(3, '0')}`,
      organizationId: orgValues[orgIndex]!.id,
      status,
      plan,
      interval: 'month' as const,
      seats: plan === 'team' ? 5 : 1,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      createdAt: created,
      updatedAt: status === 'canceled' ? daysAgo(createdDaysAgo - 30) : created,
    };
  });

  // Deduplicate subscriptions per org (keep last one per org)
  const uniqueSubsByOrg = new Map<string, typeof subValues[0]>();
  for (const sub of subValues) {
    uniqueSubsByOrg.set(sub.organizationId, sub);
  }
  const dedupedSubs = Array.from(uniqueSubsByOrg.values());

  // Insert data (use onConflictDoNothing for idempotent runs)
  await db.insert(schema.users).values(userValues).onConflictDoNothing();
  console.log(`  Inserted ${userValues.length} users`);

  await db.insert(schema.organizations).values(orgValues).onConflictDoNothing();
  console.log(`  Inserted ${orgValues.length} organizations`);

  await db.insert(schema.subscriptions).values(dedupedSubs).onConflictDoNothing();
  console.log(`  Inserted ${dedupedSubs.length} subscriptions`);

  // Create some feature flags for demo
  await db.insert(schema.featureFlags).values([
    {
      key: 'new-dashboard',
      name: 'New Dashboard UI',
      description: 'Redesigned dashboard with improved analytics',
      enabled: true,
      enabledForPlans: ['pro', 'team'],
      rolloutPercentage: 100,
    },
    {
      key: 'ai-chat-v2',
      name: 'AI Chat V2',
      description: 'Next-generation AI chat with streaming and function calling',
      enabled: true,
      enabledForPlans: ['team'],
      rolloutPercentage: 50,
    },
    {
      key: 'dark-mode-beta',
      name: 'Dark Mode Beta',
      description: 'Experimental dark theme with improved contrast',
      enabled: false,
      rolloutPercentage: 100,
    },
  ]).onConflictDoNothing();
  console.log('  Inserted 3 feature flags');

  console.log('Demo seed complete!');
}

seed().catch((err) => {
  console.error('Demo seed failed:', err);
  process.exit(1);
});
