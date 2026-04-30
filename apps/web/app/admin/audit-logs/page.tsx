// @ts-nocheck
export const dynamic = "force-dynamic";

import { db } from "@launchkit/database";
import { auditLogs } from "@launchkit/database";
import { desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuditLogTable } from "@/components/admin/audit-log-table";

const PAGE_SIZE = 50;

export default async function AdminAuditLogsPage() {
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs);

  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(PAGE_SIZE);

  const total = Number(countResult.count);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all user actions and system events across your platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
          <CardDescription>Filter, search, and export audit trail data.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogTable
            initialLogs={JSON.parse(JSON.stringify(logs))}
            totalCount={total}
            currentPage={1}
            pageSize={PAGE_SIZE}
          />
        </CardContent>
      </Card>
    </div>
  );
}
