// @ts-nocheck
import { db } from "@launchkit/database";
import { dripCampaigns } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDripStats } from "@/lib/drip";
import { CampaignEditor } from "@/components/admin/campaign-editor";
import { CampaignStats } from "@/components/admin/campaign-stats";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  const [campaign] = await db
    .select()
    .from(dripCampaigns)
    .where(eq(dripCampaigns.id, campaignId))
    .limit(1);

  if (!campaign) {
    notFound();
  }

  const stats = await getDripStats(campaignId);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Campaigns
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
          <Badge variant={campaign.enabled ? "default" : "secondary"}>
            {campaign.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        {campaign.description && (
          <p className="text-muted-foreground mt-1">{campaign.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Trigger: <code className="px-1 py-0.5 rounded bg-muted text-xs">{campaign.trigger}</code>
        </p>
      </div>

      <CampaignStats stats={stats} />
      <CampaignEditor campaignId={campaignId} />
    </div>
  );
}
