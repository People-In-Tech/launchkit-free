"use client";
// @ts-nocheck

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, TrendingUp, Zap, DollarSign, Activity } from "lucide-react";

type UsageRow = {
  id: string;
  userId: string;
  model: string;
  feature: string;
  totalTokens: number;
  costUsd: number;
  createdAt: string;
};

type Summary = {
  totalTokens: number;
  totalCost: number;
  topModel: string;
  callCount: number;
};

export default function AiUsagePage() {
  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    async function fetchUsage() {
      setLoading(true);
      try {
        const res = await fetch(`/api/team/ai-usage?period=${period}`);
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        setUsage(json.data ?? []);
        setSummary(json.summary ?? null);
      } catch {
        // Graceful degradation — show empty state
        setUsage([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, [period]);

  const statCards = summary
    ? [
        {
          label: "Total Tokens",
          value: summary.totalTokens.toLocaleString(),
          icon: Zap,
          color: "text-indigo-400",
        },
        {
          label: "Estimated Cost",
          value: `$${summary.totalCost.toFixed(4)}`,
          icon: DollarSign,
          color: "text-emerald-400",
        },
        {
          label: "AI Calls",
          value: summary.callCount.toLocaleString(),
          icon: Activity,
          color: "text-cyan-400",
        },
        {
          label: "Top Model",
          value: summary.topModel || "—",
          icon: TrendingUp,
          color: "text-purple-400",
        },
      ]
    : [];

  const FEATURE_COLORS: Record<string, string> = {
    chat: "bg-indigo-500/10 text-indigo-400",
    agent: "bg-purple-500/10 text-purple-400",
    rag: "bg-cyan-500/10 text-cyan-400",
    image: "bg-amber-500/10 text-amber-400",
    embed: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Usage</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track token usage and costs across your team.
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Usage table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent AI Calls</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : usage.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <Activity className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No AI usage recorded yet.</p>
              <p className="text-xs text-muted-foreground">
                Usage is tracked automatically when team members use AI features.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.slice(0, 50).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={FEATURE_COLORS[row.feature] ?? ""}
                        >
                          {row.feature}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.model}</TableCell>
                      <TableCell className="text-right text-sm">
                        {row.totalTokens?.toLocaleString() ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        ${(row.costUsd ?? 0).toFixed(5)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
