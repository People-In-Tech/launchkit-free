"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Plus } from "lucide-react";
import { CreateApiKeyDialog } from "./create-api-key-dialog";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[] | null;
  rateLimit: number | null;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revoked: boolean;
  createdAt: string;
}

export function ApiKeyList({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function refreshKeys() {
    const res = await fetch("/api/keys");
    if (res.ok) {
      const data = await res.json();
      setKeys(data);
    }
  }

  async function handleRevoke(keyId: string) {
    if (!confirm("Are you sure you want to revoke this API key? This cannot be undone.")) return;

    setRevokingId(keyId);
    try {
      const res = await fetch(`/api/keys/${keyId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("API key revoked");
      await refreshKeys();
    } catch {
      toast.error("Failed to revoke API key");
    } finally {
      setRevokingId(null);
    }
  }

  const activeKeys = keys.filter((k) => !k.revoked);
  const revokedKeys = keys.filter((k) => k.revoked);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Key</th>
              <th className="p-3 text-left font-medium">Scopes</th>
              <th className="p-3 text-left font-medium">Rate Limit</th>
              <th className="p-3 text-left font-medium">Last Used</th>
              <th className="p-3 text-left font-medium">Created</th>
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeKeys.map((key) => (
              <tr key={key.id} className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">{key.name}</td>
                <td className="p-3">
                  <code className="rounded bg-muted px-2 py-0.5 text-xs">{key.keyPrefix}••••••••</code>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {key.scopes?.map((scope) => (
                      <span
                        key={scope}
                        className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{key.rateLimit?.toLocaleString()}/hr</td>
                <td className="p-3 text-muted-foreground">
                  {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(key.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRevoke(key.id)}
                    disabled={revokingId === key.id}
                  >
                    {revokingId === key.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
            {activeKeys.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No active API keys. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {revokedKeys.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Revoked Keys</h3>
          <div className="rounded-md border opacity-60">
            <table className="w-full text-sm">
              <tbody>
                {revokedKeys.map((key) => (
                  <tr key={key.id} className="border-b">
                    <td className="p-3 line-through">{key.name}</td>
                    <td className="p-3">
                      <code className="rounded bg-muted px-2 py-0.5 text-xs">{key.keyPrefix}••••••••</code>
                    </td>
                    <td className="p-3 text-destructive text-xs">Revoked</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateApiKeyDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refreshKeys}
      />
    </div>
  );
}
