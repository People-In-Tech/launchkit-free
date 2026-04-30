// @ts-nocheck
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@launchkit/database";
import { apiKeys } from "@launchkit/database";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ApiKeyList } from "@/components/settings/api-key-list";

export default async function ApiKeysSettingsPage() {
  const { orgId } = await auth();

  if (!orgId) {
    redirect("/dashboard");
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      rateLimit: apiKeys.rateLimit,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      revoked: apiKeys.revoked,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.orgId, orgId))
    .orderBy(desc(apiKeys.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Manage API keys for programmatic access to your organization&apos;s data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            API keys grant programmatic access. Keep them secure and rotate regularly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyList initialKeys={JSON.parse(JSON.stringify(keys))} />
        </CardContent>
      </Card>
    </div>
  );
}
