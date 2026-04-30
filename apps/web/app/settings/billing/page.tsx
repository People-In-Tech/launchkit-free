"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export default function BillingSettingsPage() {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  async function handleUpgrade() {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      toast.success("Redirecting to checkout…");
      window.location.href = url;
    } catch (err) {
      toast.error("Failed to start checkout. Please try again.");
      console.error("[Billing/Checkout]", err);
    } finally {
      setIsUpgrading(false);
    }
  }

  async function handleOpenPortal() {
    setIsOpeningPortal(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      toast.success("Opening billing portal…");
      window.location.href = url;
    } catch (err) {
      toast.error("Failed to open billing portal. Please try again.");
      console.error("[Billing/Portal]", err);
    } finally {
      setIsOpeningPortal(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the Free plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">$0</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="space-y-2 text-sm">
            {["1 project", "100 AI credits/month", "Community support"].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
          <Button onClick={handleUpgrade} disabled={isUpgrading}>
            {isUpgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment methods.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No payment method on file.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleOpenPortal}
            disabled={isOpeningPortal}
          >
            {isOpeningPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleOpenPortal}
            disabled={isOpeningPortal}
          >
            {isOpeningPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Open Billing Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
