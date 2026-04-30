"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, MousePointerClick, UserPlus, DollarSign, TrendingUp } from "lucide-react";
import { ReferralShare } from "./referral-share";

interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  clicks: number;
  signups: number;
  conversions: number;
  totalEarnings: string;
  enabled: boolean;
  tier: {
    name: string;
    minReferrals: number;
    rewardType: string;
    rewardValue: string;
  } | null;
}

export function ReferralDashboard() {
  const [data, setData] = useState<ReferralCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetchReferralData();
  }, []);

  async function fetchReferralData() {
    try {
      const res = await fetch("/api/referrals");
      const json = await res.json();
      setData(json.code ? json : null);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function generateCode() {
    setGenerating(true);
    try {
      const res = await fetch("/api/referrals", { method: "POST" });
      const json = await res.json();
      setData(json);
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  }

  function copyLink() {
    if (!data) return;
    const link = `${appUrl}?ref=${data.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading referral data...</div>
      </div>
    );
  }

  if (!data || !data.code) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Start Referring</h2>
        <p className="text-muted-foreground mb-6">
          Generate your unique referral link and earn rewards for every user you bring in.
        </p>
        <Button onClick={generateCode} disabled={generating}>
          {generating ? "Generating..." : "Generate Referral Link"}
        </Button>
      </div>
    );
  }

  const referralLink = `${appUrl}?ref=${data.code}`;
  const nextTierThreshold = getNextTierThreshold(data.signups, data.tier);

  const stats = [
    { title: "Clicks", value: data.clicks ?? 0, icon: MousePointerClick },
    { title: "Signups", value: data.signups ?? 0, icon: UserPlus },
    { title: "Conversions", value: data.conversions ?? 0, icon: TrendingUp },
    { title: "Earnings", value: `$${Number(data.totalEarnings).toFixed(2)}`, icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono truncate">
              {referralLink}
            </div>
            <Button size="sm" variant="outline" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Code: <span className="font-mono font-semibold">{data.code}</span>
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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

      {/* Tier Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="text-sm">
              {data.tier ? data.tier.name : "No Tier"}
            </Badge>
            {data.tier && (
              <span className="text-sm text-muted-foreground">
                {data.tier.rewardValue}% commission on referral conversions
              </span>
            )}
          </div>
          {nextTierThreshold && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{data.signups ?? 0} referrals</span>
                <span>{nextTierThreshold} needed for next tier</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(((data.signups ?? 0) / nextTierThreshold) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Sharing */}
      <ReferralShare referralLink={referralLink} code={data.code} />
    </div>
  );
}

function getNextTierThreshold(
  currentSignups: number,
  currentTier: ReferralCode["tier"]
): number | null {
  const thresholds = [1, 5, 20, 50];
  for (const t of thresholds) {
    if (currentSignups < t) return t;
  }
  return null;
}
