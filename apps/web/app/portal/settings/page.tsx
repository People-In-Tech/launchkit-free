import { auth } from "@clerk/nextjs/server";
import { getUserEntitlement } from "@/lib/entitlement";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, CreditCard, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const entitlement = await getUserEntitlement(userId);
  const isPaid = entitlement.plan !== "free";
  const purchase = entitlement.purchase;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your licenses, invoices, and billing details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" /> Invoices & Receipts
            </CardTitle>
            <CardDescription>View your past purchase history and download invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPaid && purchase ? (
              <div className="rounded-md border p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">LaunchKit {entitlement.plan === "team" ? "Teams" : "Pro"}</span>
                  <span className="text-muted-foreground">${(purchase.amountCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{new Date(purchase.purchasedAt).toLocaleDateString()}</span>
                  <span>Paid</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No purchase history found.</p>
            )}
            <Button variant="outline" className="w-full gap-2" disabled>
              <CreditCard className="h-4 w-4" /> Open Billing Portal
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Billing portal integration coming soon. For invoice requests, please contact support.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Email Preferences
            </CardTitle>
            <CardDescription>Manage how we communicate with you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" className="rounded border-zinc-300 dark:border-zinc-700 text-primary focus:ring-primary h-4 w-4" defaultChecked />
                Product Updates
              </label>
              <p className="text-xs text-muted-foreground pl-7">
                Get notified when new components, plugins, or boilerplate versions are released.
              </p>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" className="rounded border-zinc-300 dark:border-zinc-700 text-primary focus:ring-primary h-4 w-4" defaultChecked />
                Marketing & Offers
              </label>
              <p className="text-xs text-muted-foreground pl-7">
                Occasional discounts and promotional emails.
              </p>
            </div>
            <Button className="w-full">Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
