"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowUp, ArrowDown, Clock, Mail } from "lucide-react";

interface Step {
  id: string;
  campaignId: string;
  stepOrder: number;
  delayMinutes: number;
  subject: string;
  templateName: string;
  enabled: boolean;
  sent: number;
  opened: number;
  clicked: number;
}

const TEMPLATE_OPTIONS = [
  "drip-welcome-day0",
  "drip-welcome-day1",
  "drip-welcome-day3",
  "drip-welcome-day7",
  "drip-trial-expiring",
  "drip-trial-expired",
  "drip-upgrade-nudge",
  "drip-reengagement",
];

function formatDelay(minutes: number): string {
  if (minutes === 0) return "Immediate";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
  return `${Math.round(minutes / 1440)} days`;
}

export function CampaignEditor({ campaignId }: { campaignId: string }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  // Add step form
  const [showAdd, setShowAdd] = useState(false);
  const [newDelayValue, setNewDelayValue] = useState("0");
  const [newDelayUnit, setNewDelayUnit] = useState("minutes");
  const [newSubject, setNewSubject] = useState("");
  const [newTemplate, setNewTemplate] = useState(TEMPLATE_OPTIONS[0]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSteps();
  }, [campaignId]);

  async function fetchSteps() {
    try {
      const res = await fetch(`/api/drip/campaigns/${campaignId}/steps`);
      const json = await res.json();
      setSteps(json);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function getDelayMinutes(): number {
    const val = Number(newDelayValue) || 0;
    switch (newDelayUnit) {
      case "hours": return val * 60;
      case "days": return val * 1440;
      default: return val;
    }
  }

  async function handleAddStep() {
    if (!newSubject || !newTemplate) return;
    setAdding(true);
    try {
      await fetch(`/api/drip/campaigns/${campaignId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepOrder: steps.length,
          delayMinutes: getDelayMinutes(),
          subject: newSubject,
          templateName: newTemplate,
        }),
      });
      setNewDelayValue("0");
      setNewSubject("");
      setNewTemplate(TEMPLATE_OPTIONS[0]);
      setShowAdd(false);
      fetchSteps();
    } catch {
      // silently fail
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteStep(stepId: string) {
    try {
      await fetch(`/api/drip/campaigns/${campaignId}/steps/${stepId}`, {
        method: "DELETE",
      });
      fetchSteps();
    } catch {
      // silently fail
    }
  }

  async function handleToggleStep(stepId: string, enabled: boolean) {
    try {
      await fetch(`/api/drip/campaigns/${campaignId}/steps/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, enabled: !enabled } : s))
      );
    } catch {
      // silently fail
    }
  }

  async function handleReorder(stepId: string, direction: "up" | "down") {
    const idx = steps.findIndex((s) => s.id === stepId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= steps.length) return;

    try {
      await Promise.all([
        fetch(`/api/drip/campaigns/${campaignId}/steps/${steps[idx].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stepOrder: swapIdx }),
        }),
        fetch(`/api/drip/campaigns/${campaignId}/steps/${steps[swapIdx].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stepOrder: idx }),
        }),
      ]);
      fetchSteps();
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Loading steps...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Steps Timeline</h3>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="mr-1 h-4 w-4" /> Add Step
        </Button>
      </div>

      {/* Add step form */}
      {showAdd && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Delay"
                  value={newDelayValue}
                  onChange={(e) => setNewDelayValue(e.target.value)}
                  className="w-20"
                />
                <select
                  value={newDelayUnit}
                  onChange={(e) => setNewDelayUnit(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
              <Input
                placeholder="Email subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
              <select
                value={newTemplate}
                onChange={(e) => setNewTemplate(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                {TEMPLATE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={handleAddStep} disabled={adding || !newSubject}>
                  {adding ? "Adding..." : "Add"}
                </Button>
                <Button variant="outline" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="relative">
        {steps.map((step, i) => (
          <div key={step.id} className="relative pl-8 pb-6">
            {/* Timeline line */}
            {i < steps.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-border" />
            )}
            {/* Timeline dot */}
            <div className="absolute left-1 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border bg-background">
              <Mail className="h-3 w-3 text-muted-foreground" />
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Step {step.stepOrder + 1}</span>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDelay(step.delayMinutes)}
                      </Badge>
                      <button
                        onClick={() => handleToggleStep(step.id, step.enabled)}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer ${
                          step.enabled
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {step.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                    <p className="text-sm font-medium">{step.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Template: {step.templateName}
                    </p>

                    {/* Step metrics */}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Sent: {step.sent}</span>
                      <span>Opened: {step.opened}</span>
                      <span>Clicked: {step.clicked}</span>
                      {step.sent > 0 && (
                        <span>
                          Open rate: {((step.opened / step.sent) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={i === 0}
                      onClick={() => handleReorder(step.id, "up")}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={i === steps.length - 1}
                      onClick={() => handleReorder(step.id, "down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteStep(step.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {steps.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No steps yet. Add your first step to this campaign.
          </div>
        )}
      </div>
    </div>
  );
}
