"use client";

import { useCallback, useState } from "react";
import { WebhookList } from "@/components/settings/webhook-list";
import { AddWebhookDialog } from "@/components/settings/add-webhook-dialog";

export function WebhooksManager() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEndpointAdded = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddWebhookDialog onEndpointAdded={handleEndpointAdded} />
      </div>
      <WebhookList key={refreshKey} />
    </div>
  );
}
