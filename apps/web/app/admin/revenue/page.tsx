// @ts-nocheck
export const dynamic = 'force-dynamic';

import { db } from '@launchkit/database';
import { subscriptions, users, organizations } from '@launchkit/database';
import { sql, count, eq, gte, and, lt, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { WaterfallChart } from './revenue-charts';

const planPricing: Record<string, number> = { free: 0, pro: 29, team: 79 };

function monthsAgo(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getRevenueMetrics() {
  const [
    activeSubsResult,
    planDistResult,
    canceledThisMonthResult,
    activeStartOfMonthResult,
    totalUsersResult,
    recentUsersWithSubResult,
    recentChangesResult,
  ] = await Promise.all([
    // Active subscriptions count
    db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, 'active')),
    // Plan distribution for MRR
    db.select({ plan: subscriptions.plan, count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'))
      .groupBy(subscriptions.plan),
    // Canceled this month (for churn)
    db.select({ count: count() }).from(subscriptions)
      .where(and(
        eq(subscriptions.status, 'canceled'),
        gte(subscriptions.updatedAt, monthsAgo(0))
      )),
    // Active at start of month (approximate: created before this month)
    db.select({ count: count() }).from(subscriptions)
      .where(and(
        lt(subscriptions.createdAt, monthsAgo(0)),
        // was active at some point
      )),
    // Total users for trial conversion
    db.select({ count: count() }).from(users),
    // Users who got a subscription within 14 days of creation
    db.select({ count: count() }).from(users)
      .innerJoin(organizations, sql`true`)
      .innerJoin(subscriptions, and(
        eq(subscriptions.organizationId, organizations.id),
        eq(subscriptions.status, 'active'),
      ))
      .where(
        sql`${subscriptions.createdAt} <= ${users.createdAt} + interval '14 days'`
      ),
    // Recent subscription changes
    db.select({
      id: subscriptions.id,
      orgId: subscriptions.organizationId,
      plan: subscriptions.plan,
      status: subscriptions.status,
      updatedAt: subscriptions.updatedAt,
    })
      .from(subscriptions)
      .orderBy(desc(subscriptions.updatedAt))
      .limit(10),
  ]);

  const activeSubs = activeSubsResult[0]?.count ?? 0;
  const mrr = planDistResult.reduce((sum, row) => sum + (planPricing[row.plan] ?? 0) * row.count, 0);
  const canceledThisMonth = canceledThisMonthResult[0]?.count ?? 0;
  const activeStartOfMonth = activeStartOfMonthResult[0]?.count ?? 0;
  const churnRate = activeStartOfMonth > 0 ? canceledThisMonth / activeStartOfMonth : 0;
  const arpu = activeSubs > 0 ? mrr / activeSubs : 0;
  const ltv = churnRate > 0 ? arpu / churnRate : arpu * 24; // Fallback: 24-month LTV
  const totalUsers = totalUsersResult[0]?.count ?? 0;
  const convertedUsers = recentUsersWithSubResult[0]?.count ?? 0;
  const trialConversion = totalUsers > 0 ? convertedUsers / totalUsers : 0;

  return {
    mrr,
    activeSubs,
    churnRate,
    arpu,
    ltv,
    trialConversion,
    recentChanges: recentChangesResult,
  };
}

async function getWaterfallData() {
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = monthsAgo(i);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    months.push({
      label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      start,
      end,
    });
  }

  const results = await Promise.all(
    months.map(async (m) => {
      const [newResult, churnedResult] = await Promise.all([
        // New subscriptions this month
        db.select({ plan: subscriptions.plan, count: count() })
          .from(subscriptions)
          .where(and(
            gte(subscriptions.createdAt, m.start),
            lt(subscriptions.createdAt, m.end),
            eq(subscriptions.status, 'active'),
          ))
          .groupBy(subscriptions.plan),
        // Churned subscriptions this month
        db.select({ plan: subscriptions.plan, count: count() })
          .from(subscriptions)
          .where(and(
            eq(subscriptions.status, 'canceled'),
            gte(subscriptions.updatedAt, m.start),
            lt(subscriptions.updatedAt, m.end),
          ))
          .groupBy(subscriptions.plan),
      ]);

      const newMrr = newResult.reduce((s, r) => s + (planPricing[r.plan] ?? 0) * r.count, 0);
      const churnedMrr = -churnedResult.reduce((s, r) => s + (planPricing[r.plan] ?? 0) * r.count, 0);

      return {
        label: m.label,
        newMrr,
        expansionMrr: 0, // Would need plan change tracking
        contractionMrr: 0,
        churnedMrr,
        netNewMrr: newMrr + churnedMrr,
      };
    })
  );

  return results;
}

export default async function AdminRevenuePage() {
  const [metrics, waterfall] = await Promise.all([
    getRevenueMetrics(),
    getWaterfallData(),
  ]);

  const kpiCards = [
    { title: 'MRR', value: formatCurrency(metrics.mrr), subtitle: `ARR: ${formatCurrency(metrics.mrr * 12)}` },
    { title: 'Active Subscriptions', value: metrics.activeSubs.toLocaleString(), subtitle: 'Paid plans' },
    { title: 'Churn Rate', value: `${(metrics.churnRate * 100).toFixed(1)}%`, subtitle: 'Monthly churn' },
    { title: 'ARPU', value: formatCurrency(metrics.arpu), subtitle: 'Per active subscription' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revenue Intelligence</h1>
        <p className="text-muted-foreground">
          Subscription metrics, churn analysis, and revenue trends.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MRR Waterfall */}
      <Card>
        <CardHeader>
          <CardTitle>MRR Waterfall (Last 6 Months)</CardTitle>
          <CardDescription>New, expansion, contraction, and churned MRR by month</CardDescription>
        </CardHeader>
        <CardContent>
          {waterfall.length > 0 ? (
            <WaterfallChart data={waterfall} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No subscription data available yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LTV Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Lifetime Value</CardTitle>
            <CardDescription>Estimated LTV based on ARPU and churn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(metrics.ltv)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ARPU ({formatCurrency(metrics.arpu)}) / monthly churn ({(metrics.churnRate * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        {/* Trial Conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Trial → Paid Conversion</CardTitle>
            <CardDescription>Users converting within 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(metrics.trialConversion * 100).toFixed(1)}%</div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Funnel</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(metrics.trialConversion * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Changes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Changes</CardTitle>
            <CardDescription>Latest subscription activity</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.recentChanges.length > 0 ? (
              <div className="space-y-3">
                {metrics.recentChanges.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        sub.status === 'active' ? 'bg-green-500' :
                        sub.status === 'canceled' ? 'bg-red-500' :
                        'bg-amber-500'
                      }`} />
                      <span className="font-medium capitalize">{sub.plan}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{sub.status}</span>
                      <span>{sub.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No subscription activity yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
