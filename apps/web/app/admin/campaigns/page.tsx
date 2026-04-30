import { CampaignList } from "@/components/admin/campaign-list";

export default function AdminCampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Drip Campaigns</h1>
        <p className="text-muted-foreground">
          Manage automated email sequences triggered by user lifecycle events.
        </p>
      </div>

      <CampaignList />
    </div>
  );
}
