// @ts-nocheck
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@launchkit/database";
import { ssoConfigs } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { SSOConfigForm } from "@/components/settings/sso-config-form";

export default async function SSOSettingsPage() {
  const { orgId } = await auth();

  if (!orgId) {
    redirect("/dashboard");
  }

  const [config] = await db
    .select()
    .from(ssoConfigs)
    .where(eq(ssoConfigs.orgId, orgId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SSO / SAML</h1>
        <p className="text-muted-foreground">
          Configure single sign-on for your organization.
        </p>
      </div>

      <SSOConfigForm initialConfig={config ?? null} />
    </div>
  );
}
