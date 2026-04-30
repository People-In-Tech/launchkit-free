import { SignUp } from "@clerk/nextjs";
import { ClerkNotConfigured } from "@/components/clerk-not-configured";
import {
  AuthSplitLayout,
  clerkAppearance,
} from "@/components/auth/auth-split-layout";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <ClerkNotConfigured intent="sign up" />;
  }
  return (
    <AuthSplitLayout
      eyebrow="Account Required"
      title="Create an account to checkout."
      subtitle="We just need an account to securely process your payment and automatically send your GitHub repository invite."
      bullets={[
        "11 AI providers · 16 production modules",
        "Auth, billing, teams, RAG, agents — all wired up",
        "One-time $149 · lifetime updates · no subscription",
      ]}
    >
      <div className="w-full">
        <SignUp
          signInUrl="/auth/sign-in"
          fallbackRedirectUrl="/portal"
          appearance={clerkAppearance}
        />
      </div>
    </AuthSplitLayout>
  );
}
