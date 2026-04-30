import type { PluginManifest } from "./types";

const pluginRegistry = new Map<string, PluginManifest>();

export function registerPlugin(manifest: PluginManifest): void {
  pluginRegistry.set(manifest.name, manifest);
}

export function getPlugin(name: string): PluginManifest | undefined {
  return pluginRegistry.get(name);
}

export function listPlugins(): PluginManifest[] {
  return Array.from(pluginRegistry.values());
}

// Register built-in plugins
const builtinPlugins: PluginManifest[] = [
  {
    name: "waitlist",
    description: "Pre-launch waitlist with email capture and referral tracking",
    version: "1.0.0",
    files: [
      { src: "components/waitlist-form.tsx", dest: "components/plugins/waitlist/waitlist-form.tsx" },
      { src: "components/waitlist-admin.tsx", dest: "components/plugins/waitlist/waitlist-admin.tsx" },
      { src: "api/route.ts", dest: "app/api/waitlist/route.ts" },
      { src: "pages/waitlist-page.tsx", dest: "app/(marketing)/waitlist/page.tsx" },
    ],
    schema: "schema.ts",
    dependencies: [],
  },
  {
    name: "feedback",
    description: "User feedback collection with voting and status management",
    version: "1.0.0",
    files: [
      { src: "components/feedback-widget.tsx", dest: "components/plugins/feedback/feedback-widget.tsx" },
      { src: "components/feedback-board.tsx", dest: "components/plugins/feedback/feedback-board.tsx" },
      { src: "components/feedback-admin.tsx", dest: "components/plugins/feedback/feedback-admin.tsx" },
      { src: "api/route.ts", dest: "app/api/feedback/route.ts" },
      { src: "pages/feedback-page.tsx", dest: "app/(marketing)/feedback/page.tsx" },
    ],
    schema: "schema.ts",
    dependencies: [],
  },
  {
    name: "testimonials",
    description: "Customer testimonial wall with ratings and featured items",
    version: "1.0.0",
    files: [
      { src: "components/testimonial-card.tsx", dest: "components/plugins/testimonials/testimonial-card.tsx" },
      { src: "components/testimonial-wall.tsx", dest: "components/plugins/testimonials/testimonial-wall.tsx" },
      { src: "components/testimonial-admin.tsx", dest: "components/plugins/testimonials/testimonial-admin.tsx" },
      { src: "api/route.ts", dest: "app/api/testimonials/route.ts" },
    ],
    schema: "schema.ts",
    dependencies: [],
  },
  {
    name: "help-center",
    description: "Self-serve help center with categories, articles, and search",
    version: "1.0.0",
    files: [
      { src: "components/help-search.tsx", dest: "components/plugins/help-center/help-search.tsx" },
      { src: "components/article-list.tsx", dest: "components/plugins/help-center/article-list.tsx" },
      { src: "components/article-page.tsx", dest: "components/plugins/help-center/article-page.tsx" },
      { src: "api/route.ts", dest: "app/api/help/search/route.ts" },
      { src: "pages/help-page.tsx", dest: "app/help/page.tsx" },
      { src: "pages/help-article-page.tsx", dest: "app/help/[slug]/page.tsx" },
    ],
    schema: "schema.ts",
    dependencies: [],
  },
  {
    name: "changelog",
    description: "Product changelog with timeline view and RSS feed",
    version: "1.0.0",
    files: [
      { src: "components/changelog-list.tsx", dest: "components/plugins/changelog/changelog-list.tsx" },
      { src: "components/changelog-entry.tsx", dest: "components/plugins/changelog/changelog-entry.tsx" },
      { src: "components/changelog-admin.tsx", dest: "components/plugins/changelog/changelog-admin.tsx" },
      { src: "api/route.ts", dest: "app/api/changelog/route.ts" },
      { src: "api/rss/route.ts", dest: "app/api/changelog/rss/route.ts" },
    ],
    schema: "schema.ts",
    dependencies: [],
  },
];

const vibeCoderPlugins: PluginManifest[] = [
  {
    name: "ai-image",
    description: "AI image generation dashboard — DALL-E 3, Flux, Stable Diffusion",
    version: "1.0.0",
    files: [
      { src: "components/image-generator.tsx", dest: "components/ai/image-generator.tsx" },
      { src: "api/route.ts", dest: "app/api/ai/image/route.ts" },
      { src: "pages/images-page.tsx", dest: "app/dashboard/images/page.tsx" },
    ],
    schema: undefined,
    dependencies: [],
  },
  {
    name: "scaffold",
    description: "CLI generator for full CRUD modules — schema + API routes + dashboard pages + components",
    version: "1.0.0",
    files: [
      { src: "scripts/scaffold.mjs", dest: "scripts/scaffold.mjs" },
    ],
    schema: undefined,
    dependencies: [],
  },
  {
    name: "dev-toolbar",
    description: "Floating developer overlay — user info, feature flags, quick-nav, MCP shortcuts (dev only)",
    version: "1.0.0",
    files: [
      { src: "components/dev-toolbar.tsx", dest: "components/dev-toolbar.tsx" },
    ],
    schema: undefined,
    dependencies: [],
  },
];

for (const plugin of builtinPlugins) {
  registerPlugin(plugin);
}

for (const plugin of vibeCoderPlugins) {
  registerPlugin(plugin);
}
