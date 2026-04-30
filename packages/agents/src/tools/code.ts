// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";

/**
 * Code analysis tool — analyzes code snippets without executing them.
 * For actual execution, integrate with E2B or a sandboxed runtime.
 */
export const codeTool = tool({
  description:
    "Analyze code, explain what it does, find bugs, suggest improvements, or convert between languages. Does NOT execute code.",
  parameters: z.object({
    code: z.string().describe("The code to analyze"),
    language: z.string().optional().describe("Programming language (auto-detected if omitted)"),
    task: z
      .enum(["explain", "review", "optimize", "convert", "debug", "document"])
      .default("review")
      .describe("What to do with the code"),
    targetLanguage: z
      .string()
      .optional()
      .describe("Target language for conversion tasks"),
  }),
  execute: async ({ code, language, task, targetLanguage }) => {
    // This tool returns a structured prompt that gets processed by the LLM
    // In production, you could call E2B for actual execution:
    // https://e2b.dev/docs
    return {
      instruction: `${task.toUpperCase()} this ${language ?? "code"}:\n\n\`\`\`${language ?? ""}\n${code}\n\`\`\`${targetLanguage ? `\n\nConvert to ${targetLanguage}.` : ""}`,
      note: "Respond with your analysis based on the instruction above.",
    };
  },
});

/**
 * Scaffold tool — wraps the LaunchKit scaffold CLI programmatically
 */
export const scaffoldTool = tool({
  description:
    "Generate a full CRUD module (database schema, API routes, dashboard page, components) for a given entity name.",
  parameters: z.object({
    moduleName: z
      .string()
      .regex(/^[a-z][a-z0-9-]*$/, "Use lowercase letters, digits, and hyphens")
      .describe("The module name, e.g. 'products' or 'invoices'"),
  }),
  execute: async ({ moduleName }) => {
    // Returns instructions rather than executing (agents run in API context)
    return {
      command: `node scripts/scaffold.mjs ${moduleName}`,
      files: [
        `packages/database/src/schema/${moduleName}.ts`,
        `apps/web/app/api/${moduleName}/route.ts`,
        `apps/web/app/dashboard/${moduleName}/page.tsx`,
        `apps/web/components/${moduleName}/${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Table.tsx`,
        `apps/web/components/${moduleName}/${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Form.tsx`,
        `apps/web/components/${moduleName}/${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}PageClient.tsx`,
      ],
      nextSteps: [
        `Export schema from packages/database/src/schema/index.ts`,
        `Run pnpm db:push`,
        `Add sidebar nav entry`,
      ],
    };
  },
});
