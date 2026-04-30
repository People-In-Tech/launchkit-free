/**
 * Trigger.dev project configuration for LaunchKit.
 *
 * @see https://trigger.dev/docs/config/config-file
 *
 * Prerequisites:
 *   1. Create a project at https://cloud.trigger.dev
 *   2. Set TRIGGER_SECRET_KEY in .env.local
 *   3. Run: npx trigger.dev@latest init
 *   4. Run: pnpm --filter @launchkit/web dev:trigger
 */

import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "launchkit",

  // All job files (Trigger.dev will autodiscover task() exports)
  dirs: ["./src/jobs", "../../packages/jobs/src/tasks"],

  // Log level for job runs
  logLevel: "info",

  // Retry defaults (individual tasks can override)
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30_000,
      factor: 2,
      randomize: true,
    },
  },

  // Machines (resource allocation per task)
  // Options: "micro" | "small-1x" | "small-2x" | "medium-1x" | "medium-2x" | "large-1x" | "large-2x"
  machine: "small-1x",
});
