import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReferralDashboard } from "@/components/referrals/referral-dashboard";
import { ReferralLeaderboard } from "@/components/referrals/referral-leaderboard";

export default async function ReferralsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground">
          Share your referral link and earn rewards for every new user you bring in.
        </p>
      </div>

      <ReferralDashboard />
      <ReferralLeaderboard />
    </div>
  );
}
