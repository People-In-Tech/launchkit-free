"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  userId: string;
  code: string;
  signups: number;
  conversions: number;
}

const TIER_BADGES: Record<string, string> = {
  Platinum: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Silver: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  Bronze: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

function getTierName(signups: number): string {
  if (signups >= 50) return "Platinum";
  if (signups >= 20) return "Gold";
  if (signups >= 5) return "Silver";
  if (signups >= 1) return "Bronze";
  return "";
}

export function ReferralLeaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/referrals/leaderboard")
      .then((res) => res.json())
      .then(setLeaders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Referrers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium w-12">#</th>
                <th className="p-3 text-left font-medium">Referrer</th>
                <th className="p-3 text-left font-medium">Tier</th>
                <th className="p-3 text-right font-medium">Signups</th>
                <th className="p-3 text-right font-medium">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((entry, i) => {
                const tier = getTierName(entry.signups);
                return (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{i + 1}</td>
                    <td className="p-3 font-mono text-xs">{entry.userId.slice(0, 12)}...</td>
                    <td className="p-3">
                      {tier && (
                        <Badge variant="secondary" className={TIER_BADGES[tier]}>
                          {tier}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">{entry.signups}</td>
                    <td className="p-3 text-right">{entry.conversions}</td>
                  </tr>
                );
              })}
              {leaders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No referrals yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
