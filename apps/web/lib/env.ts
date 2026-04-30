import { z } from "zod";

const envSchema = z.object({
  // Stripe (required for selling)
  STRIPE_SECRET_KEY: z.string().min(1, "Required for checkout"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Required for webhook verification"),
  STRIPE_PRICE_LAUNCHKIT_PRO: z.string().min(1, "Required for Pro plan checkout"),
  STRIPE_PRICE_LAUNCHKIT_TEAM: z.string().min(1, "Required for Team plan checkout"),

  // App URL (required for checkout redirect URLs)
  NEXT_PUBLIC_APP_URL: z.string().url("Must be a valid URL"),

  // GitHub (required for repo access after purchase)
  LAUNCHKIT_GITHUB_TOKEN: z.string().min(1, "Required for GitHub auto-invite"),
  LAUNCHKIT_PRIVATE_REPO_SLUG: z.string().includes("/", { message: "Must be owner/repo format" }),

  // Email (required for purchase confirmation)
  RESEND_API_KEY: z.string().min(1, "Required for transactional emails"),

  // Auth (required for sign-in/sign-up)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "Required for authentication"),
  CLERK_SECRET_KEY: z.string().min(1, "Required for authentication"),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(
      `\n[LaunchKit] Missing or invalid environment variables:\n${missing}\n\nSee .env.example for required configuration.\n`
    );
  }
  return result;
}
