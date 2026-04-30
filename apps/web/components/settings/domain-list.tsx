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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, CheckCircle, Star, RefreshCw } from "lucide-react";

interface Domain {
  id: string;
  domain: string;
  status: string;
  sslStatus: string | null;
  isPrimary: boolean | null;
  verificationToken: string | null;
  createdAt: string;
}

export function DomainList() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch("/api/domains");
      if (!res.ok) throw new Error("Failed to fetch domains");
      const data = await res.json();
      setDomains(data.domains);
    } catch {
      toast.error("Failed to load domains");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  async function handleVerify(domainId: string) {
    setActionId(domainId);
    try {
      const res = await fetch(`/api/domains/${domainId}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.verified) {
        toast.success("Domain verified successfully!");
      } else {
        toast.error(data.message || "Verification failed");
      }
      await fetchDomains();
    } catch {
      toast.error("Verification check failed");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(domainId: string) {
    setActionId(domainId);
    try {
      const res = await fetch(`/api/domains/${domainId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Domain removed");
      await fetchDomains();
    } catch {
      toast.error("Failed to remove domain");
    } finally {
      setActionId(null);
    }
  }

  async function handleSetPrimary(domainId: string) {
    setActionId(domainId);
    try {
      const res = await fetch(`/api/domains/${domainId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Primary domain updated");
      await fetchDomains();
    } catch {
      toast.error("Failed to set primary domain");
    } finally {
      setActionId(null);
    }
  }

  function statusBadge(status: string) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      verifying: "outline",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No custom domains configured.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Domain</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>SSL</TableHead>
          <TableHead>Primary</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {domains.map((d) => (
          <TableRow key={d.id}>
            <TableCell className="font-mono text-sm">{d.domain}</TableCell>
            <TableCell>{statusBadge(d.status)}</TableCell>
            <TableCell>{statusBadge(d.sslStatus || "pending")}</TableCell>
            <TableCell>
              {d.isPrimary ? (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={actionId === d.id || d.status !== "active"}
                  onClick={() => handleSetPrimary(d.id)}
                >
                  Set primary
                </Button>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {d.status !== "active" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={actionId === d.id}
                    onClick={() => handleVerify(d.id)}
                    title="Verify DNS"
                  >
                    {actionId === d.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : d.status === "active" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={actionId === d.id}
                  onClick={() => handleDelete(d.id)}
                  title="Remove domain"
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
