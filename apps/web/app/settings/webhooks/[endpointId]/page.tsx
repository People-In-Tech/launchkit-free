import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WebhookEndpointDetail } from "./endpoint-detail";

export default async function WebhookEndpointPage({
  params,
}: {
  params: Promise<{ endpointId: string }>;
}) {
  const { orgId } = await auth();
  if (!orgId) redirect("/auth/sign-in");

  const { endpointId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhook Endpoint</h1>
        <p className="text-muted-foreground">
          View endpoint details and delivery logs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Details</CardTitle>
          <CardDescription>
            Configuration and signing secret for this endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebhookEndpointDetail endpointId={endpointId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Log</CardTitle>
          <CardDescription>
            Recent webhook delivery attempts and their responses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeliveryLogWrapper endpointId={endpointId} />
        </CardContent>
      </Card>
    </div>
  );
}

import { WebhookDeliveryLog } from "@/components/settings/webhook-delivery-log";

function DeliveryLogWrapper({ endpointId }: { endpointId: string }) {
  return <WebhookDeliveryLog endpointId={endpointId} />;
}
