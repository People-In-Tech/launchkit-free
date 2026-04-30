import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WebhooksManager } from "./webhooks-manager";

export default async function WebhooksSettingsPage() {
  const { orgId } = await auth();
  if (!orgId) redirect("/auth/sign-in");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground">
          Configure webhook endpoints to receive event notifications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
          <CardDescription>
            Manage endpoints that receive real-time event notifications from your
            organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebhooksManager />
        </CardContent>
      </Card>
    </div>
  );
}
