// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@launchkit/database';
import { subscriptions } from '@launchkit/database';
import { count, eq, and, gte, lt } from 'drizzle-orm';

const planPricing: Record<string, number> = { free: 0, pro: 29, team: 79 };

function monthStart() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(request: Request) {
  const apiKey = process.env.METRICS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'METRICS_API_KEY not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [activeResult, planDistResult, canceledResult, startOfMonthActiveResult, newThisMonthResult, churnedThisMonthResult] = await Promise.all([
    db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, 'active')),
    db.select({ plan: subscriptions.plan, count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'))
      .groupBy(subscriptions.plan),
    db.select({ count: count() }).from(subscriptions)
      .where(and(eq(subscriptions.status, 'canceled'), gte(subscriptions.updatedAt, monthStart()))),
    db.select({ count: count() }).from(subscriptions)
      .where(lt(subscriptions.createdAt, monthStart())),
    // New MRR this month
    db.select({ plan: subscriptions.plan, count: count() })
      .from(subscriptions)
      .where(and(gte(subscriptions.createdAt, monthStart()), eq(subscriptions.status, 'active')))
      .groupBy(subscriptions.plan),
    // Churned MRR this month
    db.select({ plan: subscriptions.plan, count: count() })
      .from(subscriptions)
      .where(and(eq(subscriptions.status, 'canceled'), gte(subscriptions.updatedAt, monthStart())))
      .groupBy(subscriptions.plan),
  ]);

  const activeSubs = activeResult[0]?.count ?? 0;
  const mrr = planDistResult.reduce((sum, r) => sum + (planPricing[r.plan] ?? 0) * r.count, 0);
  const canceledThisMonth = canceledResult[0]?.count ?? 0;
  const startActive = startOfMonthActiveResult[0]?.count ?? 0;
  const churnRate = startActive > 0 ? canceledThisMonth / startActive : 0;
  const arpu = activeSubs > 0 ? Math.round((mrr / activeSubs) * 100) / 100 : 0;
  const ltv = churnRate > 0 ? Math.round(arpu / churnRate) : Math.round(arpu * 24);
  const newMrrThisMonth = newThisMonthResult.reduce((s, r) => s + (planPricing[r.plan] ?? 0) * r.count, 0);
  const churnedMrrThisMonth = churnedThisMonthResult.reduce((s, r) => s + (planPricing[r.plan] ?? 0) * r.count, 0);
  const nrr = mrr > 0 ? Math.round(((mrr + newMrrThisMonth - churnedMrrThisMonth) / mrr) * 100) / 100 : 1;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    mrr,
    arr: mrr * 12,
    activeSubscriptions: activeSubs,
    churnRate: Math.round(churnRate * 1000) / 1000,
    arpu,
    ltv,
    trialConversion: 0, // Requires cross-table join — available via /admin/revenue
    netRevenueRetention: nrr,
    newMrrThisMonth,
    churnedMrrThisMonth,
  });
}
