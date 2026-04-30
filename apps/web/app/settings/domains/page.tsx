import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DomainsManager } from "./domains-manager";

export default async function DomainsSettingsPage() {
  const { orgId } = await auth();
  if (!orgId) redirect("/auth/sign-in");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Custom Domains</h1>
        <p className="text-muted-foreground">
          Configure custom domains for your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domains</CardTitle>
          <CardDescription>
            Add and manage custom domains. Each domain requires DNS verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DomainsManager />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DNS Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to connect your custom domain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <p className="font-medium">1. Add a CNAME record</p>
            <p className="text-muted-foreground">
              Point your domain to{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                cname.launchkit.dev
              </code>{" "}
              by creating a CNAME record with your DNS provider.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-medium">2. Add a TXT verification record</p>
            <p className="text-muted-foreground">
              Add a TXT record with the verification token provided when you add
              a domain. This confirms you own the domain.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-medium">3. Click Verify</p>
            <p className="text-muted-foreground">
              After adding the DNS records, click the verify button. DNS changes
              may take up to 48 hours to propagate.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
