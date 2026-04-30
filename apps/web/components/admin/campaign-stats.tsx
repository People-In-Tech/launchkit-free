"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Eye, MousePointerClick } from "lucide-react";

interface CampaignStatsProps {
  stats: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
  };
}

export function CampaignStats({ stats }: CampaignStatsProps) {
  const statCards = [
    { title: "Enrolled", value: stats.totalEnrollments, subtitle: `${stats.activeEnrollments} active`, icon: Users },
    { title: "Emails Sent", value: stats.totalSent, subtitle: `${stats.completedEnrollments} completed`, icon: Mail },
    { title: "Open Rate", value: `${stats.openRate.toFixed(1)}%`, subtitle: `${stats.totalOpened} opened`, icon: Eye },
    { title: "Click Rate", value: `${stats.clickRate.toFixed(1)}%`, subtitle: `${stats.totalClicked} clicked`, icon: MousePointerClick },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}

      {/* Funnel Visualization */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Engagement Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 h-40">
            {[
              { label: "Enrolled", value: stats.totalEnrollments, color: "bg-blue-500" },
              { label: "Sent", value: stats.totalSent, color: "bg-indigo-500" },
              { label: "Opened", value: stats.totalOpened, color: "bg-violet-500" },
              { label: "Clicked", value: stats.totalClicked, color: "bg-purple-500" },
            ].map((bar) => {
              const maxVal = Math.max(stats.totalEnrollments, 1);
              const height = (bar.value / maxVal) * 100;
              return (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-sm font-medium">{bar.value}</span>
                  <div className="w-full relative" style={{ height: "120px" }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t ${bar.color}`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
