import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Github, Rocket, Sparkles, ArrowRight, Lock, Download, LayoutDashboard } from "lucide-react";
import { getUserEntitlement } from "@/lib/entitlement";
import { GithubUsernameForm } from "./github-form";

export const dynamic = "force-dynamic";

const PUBLIC_TEMPLATE_URL =
  process.env.NEXT_PUBLIC_LAUNCHKIT_PUBLIC_TEMPLATE_URL ??
  "https://github.com/launchkit/launchkit-template";
const PRIVATE_REPO_URL =
  process.env.NEXT_PUBLIC_LAUNCHKIT_PRIVATE_REPO_URL ??
  "https://github.com/People-In-Tech/launchkit-pro";

export default async function PortalPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  const entitlement = await getUserEntitlement(userId);
  const isPaid = entitlement.plan !== "free";
  const justPurchased = (await searchParams).purchased === "1";

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {justPurchased && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">Payment successful! You now own LaunchKit. Set up your GitHub access below.</p>
        </div>
      )}
      <header>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {isPaid ? "Welcome back, builder." : "Welcome to LaunchKit."}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isPaid
            ? "You own LaunchKit Pro. Everything you need to ship is below."
            : "You're on the Free tier. Clone the open template, or upgrade to unlock the full Pro boilerplate."}
        </p>
      </header>

      {isPaid ? <PaidView entitlement={entitlement} /> : <FreeView />}
    </div>
  );
}

function FreeView() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Free tier card */}
      <Card>
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary mb-2">
            <Github className="h-5 w-5" />
          </div>
          <CardTitle>Free — public template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The open-source LaunchKit template. Great for trying the stack,
            prototyping a side project, or exploring the code before you buy.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              Next.js 15, Drizzle, shadcn/ui baseline
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              Basic auth + billing scaffolding
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              MIT-licensed, fork freely
            </li>
          </ul>
          <Button asChild variant="outline" className="w-full">
            <a href={PUBLIC_TEMPLATE_URL} target="_blank" rel="noreferrer">
              <Github className="mr-2 h-4 w-4" />
              Clone on GitHub
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Pro upgrade card */}
      <Card className="border-primary/40 shadow-lg shadow-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-md">
          Most popular
        </div>
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 mb-2">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Upgrade to Pro — $149 one-time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The full LaunchKit — private repo, all 16 modules, agent rules for
            Claude Code / Cursor / Antigravity, MCP server, and every future
            update forever.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              Private GitHub repo access
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              All enterprise modules (SSO, audit logs, webhooks)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              Lifetime updates, all sales final
            </li>
          </ul>
          <form action="/api/billing/checkout" method="POST">
            <input type="hidden" name="plan" value="pro" />
            <Button type="submit" className="w-full gap-2">
              Upgrade to Pro <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center">
            Or go to <Link href="/pricing" className="underline">pricing</Link> to compare Solo vs Teams.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PaidView({
  entitlement,
}: {
  entitlement: Awaited<ReturnType<typeof getUserEntitlement>>;
}) {
  const purchase = entitlement.purchase!;
  const planLabel = entitlement.plan === "team" ? "Teams" : "Solo";

  return (
    <div className="space-y-6">
      {/* Receipt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              LaunchKit {planLabel} — Active
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You own a perpetual license to LaunchKit {planLabel}. All future
          updates are included — pull the repo any time.
        </CardContent>
      </Card>

      {/* Private repo access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Private repo access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your GitHub username to be added as a collaborator on the
            LaunchKit Pro repo. You&apos;ll get an invite email within seconds.
          </p>
          <GithubUsernameForm
            initialUsername={purchase.githubUsername}
            alreadyInvited={!!purchase.invitedAt}
          />
          <div className="pt-2 border-t">
            <a
              href={PRIVATE_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
              Open the repo on GitHub →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* CLI / download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Start a new project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Spin up a fresh LaunchKit project with the CLI:
          </p>
          <pre className="rounded-md border bg-muted px-4 py-3 text-sm overflow-x-auto">
            <code>pnpm create launchkit@latest my-app</code>
          </pre>
          <p className="text-xs text-muted-foreground">
            The CLI picks your database, auth, and payment provider, then clones
            the Pro template locally.
          </p>
        </CardContent>
      </Card>

      {/* Explore dashboard */}
      <Card className="border-primary/30 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Explore the reference workspace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            See every LaunchKit module running live — AI chat, agents, RAG,
            prompt library, team usage analytics. Use it to understand what
            you can ship, then build the same patterns into your own copy.
          </p>
          <Button asChild className="w-full sm:w-auto gap-2">
            <Link href="/dashboard">
              Open dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
