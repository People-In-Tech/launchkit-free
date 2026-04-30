export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "LaunchKit",
  description: "Ship your SaaS this weekend.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/launchkit",
    github: "https://github.com/launchkit",
    discord: "https://discord.gg/launchkit",
  },
  creator: "LaunchKit",
  keywords: ["saas", "starter-kit", "nextjs", "neon", "clerk", "stripe"],
} as const;
