// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";

/** Fetch and read the content of a URL */
export const fetchUrlTool = tool({
  description: "Fetch and read the content of a URL. Useful for reading documentation, code, or any web page.",
  parameters: z.object({
    url: z.string().url().describe("The URL to fetch"),
    selector: z
      .string()
      .optional()
      .describe("Optional CSS selector to extract a specific element's text"),
  }),
  execute: async ({ url }) => {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "LaunchKit-Agent/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return { error: `HTTP ${res.status}`, url };
      const text = await res.text();
      // Basic HTML → text stripping
      const plain = text
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 4000);
      return { content: plain, url, length: plain.length };
    } catch (err: unknown) {
      return { error: String(err), url };
    }
  },
});
