import { SignIn } from "@clerk/nextjs";
import { ClerkNotConfigured } from "@/components/clerk-not-configured";
import {
  AuthSplitLayout,
  clerkAppearance,
} from "@/components/auth/auth-split-layout";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <ClerkNotConfigured intent="sign in" />;
  }
  return (
    <AuthSplitLayout
      eyebrow="Welcome back"
      title="Sign in to checkout."
      subtitle="We just need an account to securely process your payment and assign your GitHub repository access."
      bullets={[
        "All 16 production modules ready to go",
        "Lifetime updates · pull the latest anytime",
        "Discord community · priority support channels",
      ]}
    >
      <div className="w-full">
        <SignIn
          signUpUrl="/auth/sign-up"
          fallbackRedirectUrl="/portal"
          appearance={clerkAppearance}
        />
      </div>
    </AuthSplitLayout>
  );
}
