import {
  CodeBracketIcon,
  CubeIcon,
  CpuChipIcon,
  Square3Stack3DIcon,
  BoltIcon,
  ArrowPathIcon,
  LockClosedIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  FolderOpenIcon
} from "@heroicons/react/24/outline";

export const LAUNCHKIT_PLANS = [
  {
    id: "pro",
    name: "Solo",
    price: 149,
    priceLabel: "$149",
    priceSuffix: "one-time",
    description: "The full LaunchKit. Forever yours.",
    features: [
      { text: "Private GitHub repo access", icon: CodeBracketIcon },
      { text: "All 16 production modules", icon: CubeIcon },
      { text: "CLAUDE.md + .cursorrules + AGENTS.md", icon: CpuChipIcon },
      { text: "MCP server with 20+ AI tools (Coming soon)", icon: Square3Stack3DIcon },
      { text: "Plugin system (5 built-in plugins)", icon: BoltIcon },
      { text: "Lifetime updates — pull anytime", icon: ArrowPathIcon },
      { text: "All sales are final", icon: LockClosedIcon },
    ],
    ctaLabel: "Get Solo — $149",
    ctaHref: null,
    external: false,
    popular: true,
    highlight: true,
  },
  {
    id: "team",
    name: "Teams",
    price: 299,
    priceLabel: "$299",
    priceSuffix: "one-time",
    description: "For small teams shipping together.",
    features: [
      { text: "Everything in Solo", icon: CubeIcon },
      { text: "Up to 5 developer seats", icon: UserGroupIcon },
      { text: "Priority email support", icon: EnvelopeIcon },
      { text: "1-hour onboarding call", icon: PhoneIcon },
      { text: "Team-wide repo access", icon: FolderOpenIcon },
    ],
    ctaLabel: "Get Teams — $299",
    ctaHref: null,
    external: false,
    popular: false,
    highlight: false,
  },
] as const;

export function getLaunchKitPlan(id: "pro" | "team") {
  return LAUNCHKIT_PLANS.find((plan) => plan.id === id);
}
