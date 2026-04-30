import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? (process.env.NODE_ENV === "development" ? "http://localhost:3333" : "https://docs.getlaunchkit.app");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // /stack was renamed to /build — preserve inbound links.
      {
        source: "/stack",
        destination: "/build",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/docs",
        destination: DOCS_URL,
      },
      {
        source: "/docs/:path*",
        destination: `${DOCS_URL}/:path*`,
      },
    ];
  },
  transpilePackages: [
    "@launchkit/database",
    "@launchkit/config",
    "@launchkit/billing",
    "@launchkit/storage",
    "@launchkit/analytics",
    "@launchkit/realtime",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
