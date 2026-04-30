"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, CheckCircle, XCircle } from "lucide-react";

interface SSOConfig {
  id: string;
  orgId: string;
  provider: string;
  domain: string;
  enforceSSO: boolean | null;
  enabled: boolean | null;
  metadataUrl: string | null;
}

const PROVIDERS = [
  { value: "okta", label: "Okta" },
  { value: "azure-ad", label: "Azure AD" },
  { value: "google-workspace", label: "Google Workspace" },
  { value: "onelogin", label: "OneLogin" },
  { value: "custom", label: "Custom SAML" },
];

export function SSOConfigForm({ initialConfig }: { initialConfig: SSOConfig | null }) {
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState(initialConfig?.provider ?? "okta");
  const [domain, setDomain] = useState(initialConfig?.domain ?? "");
  const [metadataUrl, setMetadataUrl] = useState(initialConfig?.metadataUrl ?? "");
  const [enforceSSO, setEnforceSSO] = useState(initialConfig?.enforceSSO ?? false);
  const [enabled, setEnabled] = useState(initialConfig?.enabled ?? false);

  async function handleSave() {
    if (!domain.trim()) {
      toast.error("Domain is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/sso/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, domain, metadataUrl, enforceSSO, enabled }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("SSO configuration saved");
    } catch {
      toast.error("Failed to save SSO configuration");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                SSO Status
              </CardTitle>
              <CardDescription>
                SSO is handled by Clerk. Configure your SAML provider in the Clerk dashboard, then register it here for enforcement.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {enabled ? (
                <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" /> Enabled
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <XCircle className="h-4 w-4" /> Disabled
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SAML Configuration</CardTitle>
          <CardDescription>Configure your identity provider settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Domain</label>
            <Input
              placeholder="acme.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Email domain to enforce SSO for (e.g. acme.com)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">IdP Metadata URL</label>
            <Input
              placeholder="https://idp.example.com/metadata.xml"
              value={metadataUrl}
              onChange={(e) => setMetadataUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your identity provider&apos;s SAML metadata URL
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={enforceSSO}
              onClick={() => setEnforceSSO(!enforceSSO)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${enforceSSO ? "bg-primary" : "bg-input"}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${enforceSSO ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <div>
              <label className="text-sm font-medium">Enforce SSO</label>
              <p className="text-xs text-muted-foreground">
                Require all organization members to sign in via SSO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${enabled ? "bg-primary" : "bg-input"}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <div>
              <label className="text-sm font-medium">Enable SSO</label>
              <p className="text-xs text-muted-foreground">
                Activate SSO for your organization
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
