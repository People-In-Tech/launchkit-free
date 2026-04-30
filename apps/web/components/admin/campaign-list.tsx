"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings } from "lucide-react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
  description: string | null;
  stepsCount: number;
  enrollmentsCount: number;
  createdAt: string;
}

const TRIGGER_COLORS: Record<string, string> = {
  "user.created": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "trial.expiring": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  "user.inactive": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "subscription.cancelled": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("user.created");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch("/api/drip/campaigns");
      const json = await res.json();
      setCampaigns(json);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await fetch(`/api/drip/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, enabled: !enabled } : c))
      );
    } catch {
      // silently fail
    }
  }

  async function handleCreate() {
    if (!newName || !newTrigger) return;
    setCreating(true);
    try {
      const res = await fetch("/api/drip/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          trigger: newTrigger,
          description: newDescription || null,
        }),
      });
      if (res.ok) {
        setNewName("");
        setNewTrigger("user.created");
        setNewDescription("");
        setShowCreate(false);
        fetchCampaigns();
      }
    } catch {
      // silently fail
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>New Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Input
                placeholder="Campaign name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <select
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="user.created">user.created</option>
                <option value="trial.expiring">trial.expiring</option>
                <option value="user.inactive">user.inactive</option>
                <option value="subscription.cancelled">subscription.cancelled</option>
              </select>
              <Input
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating || !newName}>
                {creating ? "Creating..." : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Trigger</th>
              <th className="p-3 text-right font-medium">Steps</th>
              <th className="p-3 text-right font-medium">Enrollments</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b hover:bg-muted/50">
                <td className="p-3">
                  <Link
                    href={`/admin/campaigns/${campaign.id}`}
                    className="font-medium hover:underline"
                  >
                    {campaign.name}
                  </Link>
                  {campaign.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{campaign.description}</p>
                  )}
                </td>
                <td className="p-3">
                  <Badge
                    variant="secondary"
                    className={TRIGGER_COLORS[campaign.trigger] ?? ""}
                  >
                    {campaign.trigger}
                  </Badge>
                </td>
                <td className="p-3 text-right">{campaign.stepsCount}</td>
                <td className="p-3 text-right">{campaign.enrollmentsCount}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggle(campaign.id, campaign.enabled)}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer ${
                      campaign.enabled
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {campaign.enabled ? "Enabled" : "Disabled"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/campaigns/${campaign.id}`}>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No campaigns yet. Create your first drip campaign.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
