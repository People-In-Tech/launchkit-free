export type PlanId = "free" | "pro" | "team";

// ---------------------------------------------------------------------------
// Per-seat add-on price
// ---------------------------------------------------------------------------
export interface SeatPrice {
  /** Monthly cost per additional seat above the plan's included seats (USD) */
  monthly: number;
  /** Yearly cost per additional seat above the plan's included seats (USD) */
  yearly: number;
  /** Stripe price IDs for the per-seat line item */
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
}

// ---------------------------------------------------------------------------
// Metered usage meter
// ---------------------------------------------------------------------------
export interface UsageMeter {
  id: string;            // internal identifier, e.g. "ai_credits"
  name: string;          // display name
  unit: string;          // display unit, e.g. "credits"
  /** Stripe price ID for the metered usage line item (empty on free plans) */
  stripePriceId: string;
  /** Lemon Squeezy variant ID for the metered usage item (empty on free plans) */
  lemonSqueezyVariantId: string;
}

// ---------------------------------------------------------------------------
// Optional add-on
// ---------------------------------------------------------------------------
export interface AddOn {
  id: string;
  name: string;
  description: string;
  pricing: {
    monthly: number;
    yearly: number;
    stripePriceId: { monthly: string; yearly: string };
    lemonSqueezyVariantId: { monthly: string; yearly: string };
  };
}

// ---------------------------------------------------------------------------
// Full plan definition
// ---------------------------------------------------------------------------
export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  features: string[];
  limits: {
    seats: number;
    aiCreditsPerMonth: number;
    projects: number;
  };
  pricing: {
    monthly: number;
    yearly: number;
    /** Percentage saved vs. paying monthly for a full year */
    yearlyDiscountPercent: number;
    stripePriceId: {
      monthly: string;
      yearly: string;
    };
    /** Lemon Squeezy variant IDs (empty strings on free plan) */
    lemonSqueezyVariantId: {
      monthly: string;
      yearly: string;
    };
  };
  /** Per-seat add-on pricing (undefined on plans that don't support extra seats) */
  seatPrice?: SeatPrice;
  /** Metered usage meters for this plan */
  usageMeters: UsageMeter[];
  /** Optional premium add-ons available on this plan */
  addOns: AddOn[];
  popular?: boolean;
}

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------
export const plans: Plan[] = [
  // --------------------------------------------------------------------------
  // Free
  // --------------------------------------------------------------------------
  {
    id: "free",
    name: "Free",
    description: "For trying out the platform.",
    features: [
      "1 project",
      "100 AI credits/month",
      "Community support",
      "Basic analytics",
    ],
    limits: {
      seats: 1,
      aiCreditsPerMonth: 100,
      projects: 1,
    },
    pricing: {
      monthly: 0,
      yearly: 0,
      yearlyDiscountPercent: 0,
      stripePriceId: { monthly: "", yearly: "" },
      lemonSqueezyVariantId: { monthly: "", yearly: "" },
    },
    usageMeters: [],
    addOns: [],
  },

  // --------------------------------------------------------------------------
  // Pro
  // --------------------------------------------------------------------------
  {
    id: "pro",
    name: "Pro",
    description: "For professional developers.",
    features: [
      "Unlimited projects",
      "5,000 AI credits/month",
      "Priority support",
      "Advanced analytics",
      "Custom domain",
      "Team collaboration",
    ],
    limits: {
      seats: 5,
      aiCreditsPerMonth: 5000,
      projects: -1, // unlimited
    },
    pricing: {
      monthly: 29,
      yearly: 290,
      yearlyDiscountPercent: 17, // ≈ 2 months free
      stripePriceId: {
        monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
        yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "",
      },
      lemonSqueezyVariantId: {
        monthly: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID ?? "",
        yearly: process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID ?? "",
      },
    },
    seatPrice: {
      monthly: 9,
      yearly: 90,
      stripePriceId: {
        monthly: process.env.STRIPE_PRO_SEAT_MONTHLY_PRICE_ID ?? "",
        yearly: process.env.STRIPE_PRO_SEAT_YEARLY_PRICE_ID ?? "",
      },
    },
    usageMeters: [
      {
        id: "ai_credits",
        name: "AI Credits",
        unit: "credits",
        stripePriceId: process.env.STRIPE_PRO_AI_CREDITS_METER_PRICE_ID ?? "",
        lemonSqueezyVariantId: process.env.LEMONSQUEEZY_PRO_AI_CREDITS_VARIANT_ID ?? "",
      },
    ],
    addOns: [
      {
        id: "priority_support",
        name: "Priority Support",
        description: "Dedicated Slack channel + 4-hour SLA",
        pricing: {
          monthly: 49,
          yearly: 490,
          stripePriceId: {
            monthly: process.env.STRIPE_ADDON_PRIORITY_SUPPORT_MONTHLY ?? "",
            yearly: process.env.STRIPE_ADDON_PRIORITY_SUPPORT_YEARLY ?? "",
          },
          lemonSqueezyVariantId: {
            monthly: process.env.LEMONSQUEEZY_ADDON_PRIORITY_SUPPORT_MONTHLY ?? "",
            yearly: process.env.LEMONSQUEEZY_ADDON_PRIORITY_SUPPORT_YEARLY ?? "",
          },
        },
      },
    ],
    popular: true,
  },

  // --------------------------------------------------------------------------
  // Team
  // --------------------------------------------------------------------------
  {
    id: "team",
    name: "Team",
    description: "For growing teams and businesses.",
    features: [
      "Everything in Pro",
      "25,000 AI credits/month",
      "Up to 25 team members",
      "Admin dashboard",
      "SSO integration",
      "Dedicated support",
      "SLA guarantee",
    ],
    limits: {
      seats: 25,
      aiCreditsPerMonth: 25000,
      projects: -1,
    },
    pricing: {
      monthly: 79,
      yearly: 790,
      yearlyDiscountPercent: 17,
      stripePriceId: {
        monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID ?? "",
        yearly: process.env.STRIPE_TEAM_YEARLY_PRICE_ID ?? "",
      },
      lemonSqueezyVariantId: {
        monthly: process.env.LEMONSQUEEZY_TEAM_MONTHLY_VARIANT_ID ?? "",
        yearly: process.env.LEMONSQUEEZY_TEAM_YEARLY_VARIANT_ID ?? "",
      },
    },
    seatPrice: {
      monthly: 7,
      yearly: 70,
      stripePriceId: {
        monthly: process.env.STRIPE_TEAM_SEAT_MONTHLY_PRICE_ID ?? "",
        yearly: process.env.STRIPE_TEAM_SEAT_YEARLY_PRICE_ID ?? "",
      },
    },
    usageMeters: [
      {
        id: "ai_credits",
        name: "AI Credits",
        unit: "credits",
        stripePriceId: process.env.STRIPE_TEAM_AI_CREDITS_METER_PRICE_ID ?? "",
        lemonSqueezyVariantId: process.env.LEMONSQUEEZY_TEAM_AI_CREDITS_VARIANT_ID ?? "",
      },
      {
        id: "api_calls",
        name: "API Calls",
        unit: "calls",
        stripePriceId: process.env.STRIPE_TEAM_API_CALLS_METER_PRICE_ID ?? "",
        lemonSqueezyVariantId: process.env.LEMONSQUEEZY_TEAM_API_CALLS_VARIANT_ID ?? "",
      },
    ],
    addOns: [
      {
        id: "sso",
        name: "SSO / SAML",
        description: "Enterprise single sign-on (Okta, Azure AD, Google Workspace)",
        pricing: {
          monthly: 99,
          yearly: 990,
          stripePriceId: {
            monthly: process.env.STRIPE_ADDON_SSO_MONTHLY ?? "",
            yearly: process.env.STRIPE_ADDON_SSO_YEARLY ?? "",
          },
          lemonSqueezyVariantId: {
            monthly: process.env.LEMONSQUEEZY_ADDON_SSO_MONTHLY ?? "",
            yearly: process.env.LEMONSQUEEZY_ADDON_SSO_YEARLY ?? "",
          },
        },
      },
      {
        id: "audit_log",
        name: "Audit Log",
        description: "90-day immutable activity log with SIEM export",
        pricing: {
          monthly: 29,
          yearly: 290,
          stripePriceId: {
            monthly: process.env.STRIPE_ADDON_AUDIT_LOG_MONTHLY ?? "",
            yearly: process.env.STRIPE_ADDON_AUDIT_LOG_YEARLY ?? "",
          },
          lemonSqueezyVariantId: {
            monthly: process.env.LEMONSQUEEZY_ADDON_AUDIT_LOG_MONTHLY ?? "",
            yearly: process.env.LEMONSQUEEZY_ADDON_AUDIT_LOG_YEARLY ?? "",
          },
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function getPlan(id: PlanId): Plan | undefined {
  return plans.find((p) => p.id === id);
}

export function getActivePlans(): Plan[] {
  return plans.filter((p) => p.id !== "free");
}

/**
 * Returns the price IDs for a given plan + interval for the active billing provider.
 */
export function getPriceId(
  plan: Plan,
  interval: "monthly" | "yearly",
  provider: "stripe" | "lemonsqueezy" = "stripe"
): string {
  if (provider === "lemonsqueezy") {
    return plan.pricing.lemonSqueezyVariantId[interval];
  }
  return plan.pricing.stripePriceId[interval];
}
