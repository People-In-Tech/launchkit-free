"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Org = {
  id: string;
  name: string;
  plan: string;
  members: number;
  created: string;
};

const initialOrgs: Org[] = [
  { id: "1", name: "Acme Inc", plan: "Team", members: 12, created: "Jan 3, 2026" },
  { id: "2", name: "StartupXYZ", plan: "Pro", members: 3, created: "Jan 8, 2026" },
  { id: "3", name: "Solo Dev", plan: "Free", members: 1, created: "Jan 12, 2026" },
];

const planColors: Record<string, string> = {
  Team: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Pro: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
};

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>(initialOrgs);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDeleteOrg(org: Org) {
    const confirmed = window.confirm(
      `Delete "${org.name}"? This will remove all members and data permanently.`
    );
    if (!confirmed) return;
    setLoadingId(org.id);
    try {
      // TODO: wire to real API
      await new Promise((r) => setTimeout(r, 600));
      setOrgs((prev) => prev.filter((o) => o.id !== org.id));
      toast.success(`"${org.name}" has been deleted.`);
    } catch {
      toast.error(`Failed to delete "${org.name}". Please try again.`);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orgs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">312</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Orgs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,230</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Plan</th>
                  <th className="p-3 text-left font-medium">Members</th>
                  <th className="p-3 text-left font-medium">Created</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{org.name}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          planColors[org.plan] ?? planColors.Free
                        }`}
                      >
                        {org.plan}
                      </span>
                    </td>
                    <td className="p-3">{org.members}</td>
                    <td className="p-3 text-muted-foreground">{org.created}</td>
                    <td className="p-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={loadingId === org.id}
                        onClick={() => handleDeleteOrg(org)}
                      >
                        {loadingId === org.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
