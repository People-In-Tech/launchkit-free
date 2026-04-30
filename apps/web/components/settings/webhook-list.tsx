"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, ExternalLink } from "lucide-react";
import { truncate } from "@/lib/utils";

interface WebhookEndpoint {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  enabled: boolean | null;
  createdAt: string;
}

export function WebhookList() {
  const router = useRouter();
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchEndpoints = useCallback(async () => {
    try {
      const res = await fetch("/api/webhooks/endpoints");
      if (!res.ok) throw new Error("Failed to fetch endpoints");
      const data = await res.json();
      setEndpoints(data.endpoints);
    } catch {
      toast.error("Failed to load webhook endpoints");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  async function handleToggle(id: string, enabled: boolean) {
    setActionId(id);
    try {
      const res = await fetch(`/api/webhooks/endpoints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(enabled ? "Endpoint disabled" : "Endpoint enabled");
      await fetchEndpoints();
    } catch {
      toast.error("Failed to update endpoint");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id: string) {
    setActionId(id);
    try {
      const res = await fetch(`/api/webhooks/endpoints/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Endpoint deleted");
      await fetchEndpoints();
    } catch {
      toast.error("Failed to delete endpoint");
    } finally {
      setActionId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (endpoints.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No webhook endpoints configured.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>URL</TableHead>
          <TableHead>Events</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {endpoints.map((ep) => (
          <TableRow key={ep.id}>
            <TableCell>
              <div>
                <p className="font-mono text-sm">{truncate(ep.url, 50)}</p>
                {ep.description && (
                  <p className="text-xs text-muted-foreground">
                    {ep.description}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{ep.events.length} events</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={ep.enabled ? "default" : "outline"}>
                {ep.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/settings/webhooks/${ep.id}`)
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={actionId === ep.id}
                  onClick={() => handleToggle(ep.id, ep.enabled ?? true)}
                >
                  {ep.enabled ? "Disable" : "Enable"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={actionId === ep.id}
                  onClick={() => handleDelete(ep.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
