import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClerkNotConfigured({ intent }: { intent: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4 rounded-xl border bg-card p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <KeyRound className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-xl font-semibold">Authentication not configured</h1>
        <p className="text-sm text-muted-foreground">
          To {intent}, set <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
          and <code className="rounded bg-muted px-1 py-0.5 text-xs">CLERK_SECRET_KEY</code> in your environment.
          See <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.example</code> for the full list.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
