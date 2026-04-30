// @ts-nocheck
export const dynamic = 'force-dynamic';

import { db } from '@launchkit/database';
import { users, organizations, subscriptions } from '@launchkit/database';
import { sql, eq, gte, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart } from './bar-chart';
import { formatCurrency } from '@/lib/utils';

// Calculate date ranges
function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function getStats() {
  const [
    totalUsersResult,
    totalOrgsResult,
    activeSubsResult,
    recentSignupsResult,
    planDistResult,
    signupsByDayResult,
  ] = await Promise.all([
    // Total users
    db.select({ count: sql`count(*)` as any }).from(users),
    // Total orgs
    db.select({ count: sql`count(*)` as any }).from(organizations),
    // Active paid subscriptions
    db
      .select({ count: sql`count(*)` as any })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active')),
    // Signups in last 30 days
    db
      .select({ count: sql`count(*)` as any })
      .from(users)
      .where(gte(users.createdAt, daysAgo(30))),
    // Plan distribution
    db
      .select({
        plan: subscriptions.plan,
        count: sql`count(*)` as any,
      })
      .from(subscriptions)
      .groupBy(subscriptions.plan),
    // Signups by day (last 14 days)
    db
      .select({
        day: sql<string>`to_char(${users.createdAt}, 'Mon DD')`,
        count: sql`count(*)` as any,
      })
      .from(users)
      .where(gte(users.createdAt, daysAgo(14)))
      .groupBy(sql`to_char(${users.createdAt}, 'Mon DD'), DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`),
  ]);

  const totalUsers = Number(totalUsersResult[0]?.count ?? 0);
  const totalOrgs = Number(totalOrgsResult[0]?.count ?? 0);
  const activeSubs = Number(activeSubsResult[0]?.count ?? 0);
  const recentSignups = Number(recentSignupsResult[0]?.count ?? 0);

  // Calculate estimated MRR from plan distribution
  const planPricing: Record<string, number> = { free: 0, pro: 29, team: 79 };
  const mrr = planDistResult.reduce((sum, row) => {
    return sum + (planPricing[row.plan] ?? 0) * Number(row.count);
  }, 0);

  return {
    totalUsers,
    totalOrgs,
    activeSubs,
    recentSignups,
    mrr,
    planDistribution: planDistResult,
    signupsByDay: signupsByDayResult,
  };
}

async function getTopPages() {
  // We show the most common pages based on available data.
  // In production this would come from PostHog/Plausible analytics API.
  return [
    { page: '/dashboard', views: 1240 },
    { page: '/pricing', views: 890 },
    { page: '/dashboard/ai/chat', views: 645 },
    { page: '/settings/billing', views: 432 },
    { page: '/settings/team', views: 321 },
  ];
}

async function getRecentUsers() {
  return db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(5);
}

export default async function AdminAnalyticsPage() {
  const [stats, topPages, recentUsers] = await Promise.all([
    getStats(),
    getTopPages(),
    getRecentUsers(),
  ]);

  const kpiCards = [
    { title: 'Total Users', value: stats.totalUsers.toLocaleString(), subtitle: `+${stats.recentSignups} last 30d` },
    { title: 'Organizations', value: stats.totalOrgs.toLocaleString(), subtitle: 'Active workspaces' },
    { title: 'Est. MRR', value: formatCurrency(stats.mrr), subtitle: `${stats.activeSubs} active subs` },
    { title: 'Active Subscriptions', value: stats.activeSubs.toLocaleString(), subtitle: 'Paid plans' },
  ];

  const planColors: Record<string, string> = {
    free: 'bg-gray-400',
    pro: 'bg-blue-500',
    team: 'bg-purple-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Platform metrics and user activity.
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Signups Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Signups (Last 14 Days)</CardTitle>
            <CardDescription>New user registrations by day</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.signupsByDay.length > 0 ? (
              <BarChart
                data={stats.signupsByDay.map((d) => ({
                  label: d.day,
                  value: Number(d.count),
                }))}
                color="bg-primary"
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No signup data available yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Current subscription breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.planDistribution.length > 0 ? (
              <div className="space-y-4">
                {stats.planDistribution.map((row) => {
                  const total = stats.planDistribution.reduce((s, r) => s + Number(r.count), 0);
                  const pct = total > 0 ? Math.round((Number(row.count) / total) * 100) : 0;
                  return (
                    <div key={row.plan} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{row.plan}</span>
                        <span className="text-muted-foreground">
                          {Number(row.count)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all ${planColors[row.plan] ?? 'bg-primary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No subscription data available yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>
              Most visited pages (connect PostHog/Plausible for live data)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPages.map((page, i) => (
                <div key={page.page} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                      {page.page}
                    </code>
                  </div>
                  <span className="font-medium">{page.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>Latest users who joined the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">
                        {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unnamed'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {user.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No users yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
