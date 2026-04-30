import { PortalItemCard } from "@/components/portal/item-card";
import { auth } from "@clerk/nextjs/server";
import { getUserEntitlement } from "@/lib/entitlement";
import { Rocket, Users } from "lucide-react";
import { getLaunchKitPlan } from "@/config/launchkit-pricing";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const entitlement = await getUserEntitlement(userId);
  const isPaid = entitlement.plan !== "free";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products & Boilerplates</h1>
        <p className="mt-2 text-muted-foreground">
          Core application templates and full-stack boilerplates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PortalItemCard
          title="LaunchKit Pro"
          description="The complete AI-first SaaS starter kit. Includes all 16 production modules, agent rules, and lifetime updates."
          status={isPaid ? "owned" : "available"}
          price={getLaunchKitPlan("pro")?.price}
          icon={<Rocket className="h-5 w-5" />}
          tags={["Next.js", "Neon", "Clerk", "Stripe"]}
          actionLink="/portal"
          highlight={!isPaid}
        />
        
        <PortalItemCard
          title="LaunchKit Teams"
          description="Everything in Pro, plus enterprise SSO, audit logs, and priority discord support."
          status={entitlement.plan === "team" ? "owned" : "available"}
          price={getLaunchKitPlan("team")?.price}
          icon={<Users className="h-5 w-5" />}
          tags={["Enterprise", "SSO", "Audit Logs"]}
          actionLink="/portal"
        />
      </div>
    </div>
  );
}
