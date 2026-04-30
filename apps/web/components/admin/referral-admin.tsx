"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, MousePointerClick, UserPlus, TrendingUp, DollarSign } from "lucide-react";

interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  clicks: number;
  signups: number;
  conversions: number;
  totalEarnings: string;
  enabled: boolean;
  createdAt: string;
}

interface ReferralEvent {
  id: string;
  referralCodeId: string;
  referrerId: string;
  referredUserId: string | null;
  referredEmail: string | null;
  type: string;
  rewardAmount: string | null;
  rewardStatus: string;
  createdAt: string;
}

interface AdminData {
  codes: ReferralCode[];
  pendingRewards: ReferralEvent[];
  stats: {
    totalClicks: number;
    totalSignups: number;
    totalConversions: number;
    totalEarnings: number;
  };
  total: number;
  page: number;
  limit: number;
}

interface Tier {
  id: string;
  name: string;
  minReferrals: number;
  rewardType: string;
  rewardValue: string;
  description: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  paid: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function ReferralAdmin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Tier form state
  const [tierName, setTierName] = useState("");
  const [tierMinReferrals, setTierMinReferrals] = useState("");
  const [tierRewardType, setTierRewardType] = useState("percentage");
  const [tierRewardValue, setTierRewardValue] = useState("");
  const [tierDescription, setTierDescription] = useState("");

  useEffect(() => {
    fetchData(1);
    fetchTiers();
  }, []);

  async function fetchData(p: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals/admin?page=${p}&limit=50`);
      const json = await res.json();
      setData(json);
      setPage(p);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function fetchTiers() {
    try {
      const res = await fetch("/api/referrals/tiers");
      const json = await res.json();
      setTiers(json);
    } catch {
      // silently fail
    }
  }

  async function handleRewardAction(eventId: string, status: "approved" | "rejected") {
    try {
      await fetch("/api/referrals/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, status }),
      });
      fetchData(page);
    } catch {
      // silently fail
    }
  }

  async function handleCreateTier() {
    if (!tierName || !tierMinReferrals || !tierRewardValue) return;

    try {
      await fetch("/api/referrals/tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tierName,
          minReferrals: Number(tierMinReferrals),
          rewardType: tierRewardType,
          rewardValue: Number(tierRewardValue),
          description: tierDescription || null,
        }),
      });
      setTierName("");
      setTierMinReferrals("");
      setTierRewardValue("");
      setTierDescription("");
      fetchTiers();
    } catch {
      // silently fail
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading referral data...</div>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  const statCards = [
    { title: "Total Clicks", value: data?.stats.totalClicks ?? 0, icon: MousePointerClick },
    { title: "Total Signups", value: data?.stats.totalSignups ?? 0, icon: UserPlus },
    { title: "Conversions", value: data?.stats.totalConversions ?? 0, icon: TrendingUp },
    { title: "Total Payouts", value: `$${Number(data?.stats.totalEarnings ?? 0).toFixed(2)}`, icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Rewards */}
      {data?.pendingRewards && data.pendingRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Referrer</th>
                    <th className="p-3 text-left font-medium">Referred</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-right font-medium">Amount</th>
                    <th className="p-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pendingRewards.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{event.referrerId.slice(0, 12)}...</td>
                      <td className="p-3">{event.referredEmail ?? event.referredUserId?.slice(0, 12) ?? "—"}</td>
                      <td className="p-3">
                        <Badge variant="secondary">{event.type}</Badge>
                      </td>
                      <td className="p-3 text-right">${Number(event.rewardAmount ?? 0).toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRewardAction(event.id, "approved")}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRewardAction(event.id, "rejected")}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">#</th>
                  <th className="p-3 text-left font-medium">User</th>
                  <th className="p-3 text-left font-medium">Code</th>
                  <th className="p-3 text-right font-medium">Clicks</th>
                  <th className="p-3 text-right font-medium">Signups</th>
                  <th className="p-3 text-right font-medium">Conversions</th>
                  <th className="p-3 text-right font-medium">Earnings</th>
                  <th className="p-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.codes.map((code, i) => (
                  <tr key={code.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">{(page - 1) * (data?.limit ?? 50) + i + 1}</td>
                    <td className="p-3 font-mono text-xs">{code.userId.slice(0, 12)}...</td>
                    <td className="p-3 font-mono">{code.code}</td>
                    <td className="p-3 text-right">{code.clicks}</td>
                    <td className="p-3 text-right">{code.signups}</td>
                    <td className="p-3 text-right">{code.conversions}</td>
                    <td className="p-3 text-right">${Number(code.totalEarnings).toFixed(2)}</td>
                    <td className="p-3">
                      <Badge variant={code.enabled ? "secondary" : "outline"}>
                        {code.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {(!data?.codes || data.codes.length === 0) && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No referral codes yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => fetchData(page - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => fetchData(page + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Management */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Existing tiers */}
          {tiers.length > 0 && (
            <div className="rounded-md border mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-right font-medium">Min Referrals</th>
                    <th className="p-3 text-left font-medium">Reward Type</th>
                    <th className="p-3 text-right font-medium">Value</th>
                    <th className="p-3 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier) => (
                    <tr key={tier.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{tier.name}</td>
                      <td className="p-3 text-right">{tier.minReferrals}</td>
                      <td className="p-3">{tier.rewardType}</td>
                      <td className="p-3 text-right">{tier.rewardValue}{tier.rewardType === "percentage" ? "%" : ""}</td>
                      <td className="p-3 text-muted-foreground">{tier.description ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add tier form */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Add New Tier</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Input
                placeholder="Name"
                value={tierName}
                onChange={(e) => setTierName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Min Referrals"
                value={tierMinReferrals}
                onChange={(e) => setTierMinReferrals(e.target.value)}
              />
              <select
                value={tierRewardType}
                onChange={(e) => setTierRewardType(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
                <option value="credit">Credit</option>
              </select>
              <Input
                type="number"
                placeholder="Reward Value"
                value={tierRewardValue}
                onChange={(e) => setTierRewardValue(e.target.value)}
              />
              <Button onClick={handleCreateTier}>Add Tier</Button>
            </div>
            <Input
              placeholder="Description (optional)"
              value={tierDescription}
              onChange={(e) => setTierDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
