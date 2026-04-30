"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Download, ChevronLeft } from "lucide-react";

interface AuditLog {
  id: string;
  orgId: string | null;
  userId: string;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  auth: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  billing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  team: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  settings: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  api_key: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

function getActionColor(resource: string): string {
  return ACTION_COLORS[resource] ?? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}

export function AuditLogTable({
  initialLogs,
  totalCount,
  currentPage,
  pageSize,
}: {
  initialLogs: AuditLog[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(totalCount);
  const [page, setPage] = useState(currentPage);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  async function fetchLogs(newPage: number) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(newPage), limit: String(pageSize) });
      if (actionFilter) params.set("action", actionFilter);
      if (userSearch) params.set("userId", userSearch);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setPage(newPage);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    fetchLogs(1);
  }

  async function handleExportCSV() {
    const params = new URLSearchParams();
    if (actionFilter) params.set("action", actionFilter);
    if (userSearch) params.set("userId", userSearch);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    const res = await fetch(`/api/audit-logs/export?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="">All Actions</option>
            <option value="user.login">user.login</option>
            <option value="user.logout">user.logout</option>
            <option value="billing.subscription_created">billing.subscription_created</option>
            <option value="team.member_added">team.member_added</option>
            <option value="team.member_removed">team.member_removed</option>
            <option value="settings.updated">settings.updated</option>
            <option value="api_key.created">api_key.created</option>
            <option value="api_key.revoked">api_key.revoked</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">User</label>
          <Input
            placeholder="User ID or email"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="h-9 w-48"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button size="sm" onClick={handleFilter} disabled={loading}>
            Filter
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCSV}>
            <Download className="mr-1 h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-8 p-3" />
              <th className="p-3 text-left font-medium">Timestamp</th>
              <th className="p-3 text-left font-medium">User</th>
              <th className="p-3 text-left font-medium">Action</th>
              <th className="p-3 text-left font-medium">Resource</th>
              <th className="p-3 text-left font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <>
                <tr
                  key={log.id}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                >
                  <td className="p-3">
                    {expandedRow === log.id ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">{log.userEmail ?? log.userId}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getActionColor(log.resource)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3">{log.resource}{log.resourceId ? ` (${log.resourceId})` : ""}</td>
                  <td className="p-3 text-muted-foreground">{log.ipAddress ?? "—"}</td>
                </tr>
                {expandedRow === log.id && (
                  <tr key={`${log.id}-detail`} className="border-b bg-muted/30">
                    <td colSpan={6} className="p-4">
                      <div className="space-y-2 text-xs">
                        <div><strong>User Agent:</strong> {log.userAgent ?? "—"}</div>
                        <div><strong>Resource ID:</strong> {log.resourceId ?? "—"}</div>
                        <div><strong>Org ID:</strong> {log.orgId ?? "—"}</div>
                        {log.metadata && (
                          <div>
                            <strong>Metadata:</strong>
                            <pre className="mt-1 rounded bg-muted p-2 overflow-auto max-h-40">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => fetchLogs(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => fetchLogs(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
