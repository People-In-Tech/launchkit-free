"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Copy, CheckCircle2 } from "lucide-react";

interface AddDomainDialogProps {
  onDomainAdded: () => void;
}

export function AddDomainDialog({ onDomainAdded }: AddDomainDialogProps) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addedDomain, setAddedDomain] = useState<{
    domain: string;
    verificationToken: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add domain");
      }

      const data = await res.json();
      setAddedDomain({
        domain: data.domain.domain,
        verificationToken: data.domain.verificationToken,
      });
      toast.success("Domain added. Configure your DNS records to verify.");
      onDomainAdded();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add domain"
      );
    } finally {
      setIsAdding(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setDomain("");
      setAddedDomain(null);
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Domain</DialogTitle>
          <DialogDescription>
            Add a custom domain for your organization.
          </DialogDescription>
        </DialogHeader>

        {!addedDomain ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="app.yourdomain.com"
              />
            </div>
            <Button type="submit" disabled={isAdding || !domain.trim()}>
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Domain
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4 space-y-3">
              <p className="text-sm font-medium">DNS Configuration Required</p>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  1. Add a CNAME record pointing to your app:
                </p>
                <div className="flex items-center gap-2 rounded bg-background p-2 text-xs font-mono">
                  <span className="flex-1 truncate">
                    {addedDomain.domain} → cname.launchkit.dev
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy("cname.launchkit.dev")}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  2. Add a TXT record for verification:
                </p>
                <div className="flex items-center gap-2 rounded bg-background p-2 text-xs font-mono">
                  <span className="flex-1 truncate">
                    {addedDomain.verificationToken}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() =>
                      handleCopy(addedDomain.verificationToken)
                    }
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
