"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Delivery {
  id: string;
  event: string;
  responseStatus: number | null;
  responseBody: string | null;
  attempts: number | null;
  maxAttempts: number | null;
  deliveredAt: string | null;
  failedAt: string | null;
  createdAt: string;
  payload: unknown;
}

interface WebhookDeliveryLogProps {
  endpointId: string;
}

export function WebhookDeliveryLog({ endpointId }: WebhookDeliveryLogProps) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/webhooks/endpoints/${endpointId}/deliveries`
      );
      if (!res.ok) throw new Error("Failed to fetch deliveries");
      const data = await res.json();
      setDeliveries(data.deliveries);
    } catch {
      toast.error("Failed to load delivery logs");
    } finally {
      setIsLoading(false);
    }
  }, [endpointId]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  function statusBadge(delivery: Delivery) {
    if (delivery.deliveredAt) {
      return <Badge variant="default">{delivery.responseStatus}</Badge>;
    }
    if (delivery.failedAt) {
      return (
        <Badge variant="destructive">
          {delivery.responseStatus || "Failed"}
        </Badge>
      );
    }
    return <Badge variant="secondary">Pending</Badge>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No deliveries yet.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead>Event</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Attempts</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveries.map((d) => (
          <>
            <TableRow
              key={d.id}
              className="cursor-pointer"
              onClick={() =>
                setExpandedId(expandedId === d.id ? null : d.id)
              }
            >
              <TableCell>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {expandedId === d.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell className="font-mono text-sm">{d.event}</TableCell>
              <TableCell>{statusBadge(d)}</TableCell>
              <TableCell>
                {d.attempts}/{d.maxAttempts}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(d.createdAt)}
              </TableCell>
            </TableRow>
            {expandedId === d.id && (
              <TableRow key={`${d.id}-details`}>
                <TableCell colSpan={5}>
                  <div className="space-y-2 p-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Response Body
                      </p>
                      <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                        {d.responseBody || "No response body"}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Payload
                      </p>
                      <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify(d.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  );
}
