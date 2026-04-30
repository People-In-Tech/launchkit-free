import { ReferralAdmin } from "@/components/admin/referral-admin";

export default function AdminReferralsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground">
          Manage referral codes, review rewards, and configure tiers.
        </p>
      </div>

      <ReferralAdmin />
    </div>
  );
}
