import { Suspense } from "react";
import { WaitlistForm } from "@/components/plugins/waitlist/waitlist-form";

export const metadata = {
  title: "Join the Waitlist",
  description:
    "Sign up to get early access. Join our waitlist and be the first to know when we launch.",
};

export default function WaitlistPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Join the Waitlist
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Be among the first to experience what we&apos;re building. Sign up for
          early access and invite your friends to move up in line.
        </p>
        <Suspense>
          <WaitlistForm />
        </Suspense>
      </div>
    </div>
  );
}
