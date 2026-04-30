"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, EyeOff, Send } from "lucide-react";

interface Endpoint {
  id: string;
  url: string;
  secret: string;
  description: string | null;
  events: string[];
  enabled: boolean | null;
  createdAt: string;
}

interface WebhookEndpointDetailProps {
  endpointId: string;
}

export function WebhookEndpointDetail({
  endpointId,
}: WebhookEndpointDetailProps) {
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const fetchEndpoint = useCallback(async () => {
    try {
      const res = await fetch(`/api/webhooks/endpoints/${endpointId}`);
      if (!res.ok) throw new Error("Failed to fetch endpoint");
      const data = await res.json();
      setEndpoint(data.endpoint);
    } catch {
      toast.error("Failed to load endpoint details");
    } finally {
      setIsLoading(false);
    }
  }, [endpointId]);

  useEffect(() => {
    fetchEndpoint();
  }, [fetchEndpoint]);

  async function handleTest() {
    setIsTesting(true);
    try {
      const res = await fetch(
        `/api/webhooks/endpoints/${endpointId}/test`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`Test webhook delivered (status ${data.status})`);
      } else {
        toast.error(`Test webhook failed: ${data.error || `status ${data.status}`}`);
      }
    } catch {
      toast.error("Failed to send test webhook");
    } finally {
      setIsTesting(false);
    }
  }

  async function handleToggle() {
    if (!endpoint) return;
    setIsToggling(true);
    try {
      const res = await fetch(`/api/webhooks/endpoints/${endpointId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !endpoint.enabled }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(
        endpoint.enabled ? "Endpoint disabled" : "Endpoint enabled"
      );
      await fetchEndpoint();
    } catch {
      toast.error("Failed to update endpoint");
    } finally {
      setIsToggling(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!endpoint) {
    return <p className="text-muted-foreground">Endpoint not found.</p>;
  }

  const maskedSecret = `${endpoint.secret.slice(0, 10)}${"•".repeat(20)}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">URL</p>
          <p className="font-mono text-sm break-all">{endpoint.url}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <Badge variant={endpoint.enabled ? "default" : "outline"}>
            {endpoint.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-muted-foreground">
            Signing Secret
          </p>
          <div className="flex items-center gap-2 mt-1">
            <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
              {showSecret ? endpoint.secret : maskedSecret}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {endpoint.description && (
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">
              Description
            </p>
            <p className="text-sm">{endpoint.description}</p>
          </div>
        )}
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-muted-foreground">Events</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {endpoint.events.map((event) => (
              <Badge key={event} variant="secondary" className="font-mono text-xs">
                {event}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={isToggling}
          onClick={handleToggle}
        >
          {isToggling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {endpoint.enabled ? "Disable" : "Enable"}
        </Button>
        <Button disabled={isTesting} onClick={handleTest}>
          {isTesting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send Test
        </Button>
      </div>
    </div>
  );
}
