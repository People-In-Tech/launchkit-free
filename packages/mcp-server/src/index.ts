#!/usr/bin/env node
// @ts-nocheck
/**
 * LaunchKit MCP Server
 *
 * Exposes LaunchKit project tools to Claude Code via the Model Context Protocol.
 *
 * Setup in Claude Code:
 *   Add to ~/.claude/claude_desktop_config.json:
 *   {
 *     "mcpServers": {
 *       "launchkit": {
 *         "command": "npx",
 *         "args": ["tsx", "/path/to/launchkit/packages/mcp-server/src/index.ts"],
 *         "env": { "LAUNCHKIT_ROOT": "/path/to/launchkit" }
 *       }
 *     }
 *   }
 *
 * Or add to your project's .mcp.json for automatic detection:
 *   { "launchkit": { "command": "node", "args": ["packages/mcp-server/src/index.ts"] } }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync, exec } from "child_process";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = process.env.LAUNCHKIT_ROOT ?? process.cwd();

// ── Server ────────────────────────────────────────────────────────────────────

const server = new Server(
  { name: "launchkit", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "scaffold_module",
    description:
      "Generate a full CRUD module (schema + API routes + dashboard page + components). Returns the list of created files.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Module name in lowercase-kebab-case (e.g. 'products', 'invoices')",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "list_schema_tables",
    description: "List all database tables defined in packages/database/src/schema/",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "read_schema",
    description: "Read the Drizzle schema for a specific table",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "The schema file name without .ts extension",
        },
      },
      required: ["table"],
    },
  },
  {
    name: "list_plugins",
    description: "List all registered LaunchKit plugins",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "read_config",
    description: "Read launchkit.config.ts — project-level LaunchKit configuration",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "run_typecheck",
    description: "Run TypeScript type checking on the web app",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_env_vars",
    description: "List all expected environment variables from .env.example (values hidden)",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_project_structure",
    description: "Get a high-level overview of the project directory structure",
    inputSchema: { type: "object", properties: {} },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

// ── Tool handlers ─────────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "scaffold_module": {
        const moduleName = (args?.name as string).replace(/[^a-z0-9-]/g, "");
        const scriptPath = join(ROOT, "scripts/scaffold.mjs");
        if (!existsSync(scriptPath)) {
          return { content: [{ type: "text", text: "scaffold.mjs not found at scripts/scaffold.mjs" }] };
        }
        const output = execSync(`node ${scriptPath} ${moduleName}`, {
          cwd: ROOT,
          encoding: "utf-8",
          timeout: 30000,
        });
        return { content: [{ type: "text", text: output }] };
      }

      case "list_schema_tables": {
        const schemaDir = join(ROOT, "packages/database/src/schema");
        if (!existsSync(schemaDir)) {
          return { content: [{ type: "text", text: "Schema directory not found" }] };
        }
        const files = readdirSync(schemaDir)
          .filter((f) => f.endsWith(".ts") && f !== "index.ts")
          .map((f) => f.replace(".ts", ""));
        return { content: [{ type: "text", text: files.join("\n") }] };
      }

      case "read_schema": {
        const table = (args?.table as string).replace(/[^a-z0-9-_]/g, "");
        const schemaPath = join(ROOT, `packages/database/src/schema/${table}.ts`);
        if (!existsSync(schemaPath)) {
          return { content: [{ type: "text", text: `Schema file not found: ${table}.ts` }] };
        }
        const content = readFileSync(schemaPath, "utf-8");
        return { content: [{ type: "text", text: content }] };
      }

      case "list_plugins": {
        const registryPath = join(ROOT, "packages/plugins/src/registry.ts");
        if (!existsSync(registryPath)) {
          return { content: [{ type: "text", text: "Plugin registry not found" }] };
        }
        const content = readFileSync(registryPath, "utf-8");
        const nameMatches = [...content.matchAll(/name:\s*["']([^"']+)["']/g)];
        const names = nameMatches.map((m) => m[1]);
        return { content: [{ type: "text", text: `Registered plugins:\n${names.join("\n")}` }] };
      }

      case "read_config": {
        const configPath = join(ROOT, "launchkit.config.ts");
        if (!existsSync(configPath)) {
          return { content: [{ type: "text", text: "launchkit.config.ts not found" }] };
        }
        const content = readFileSync(configPath, "utf-8");
        return { content: [{ type: "text", text: content }] };
      }

      case "run_typecheck": {
        try {
          const output = execSync("pnpm typecheck 2>&1", {
            cwd: join(ROOT, "apps/web"),
            encoding: "utf-8",
            timeout: 60000,
          });
          return { content: [{ type: "text", text: `✔ Type check passed\n${output}` }] };
        } catch (err: unknown) {
          return { content: [{ type: "text", text: `✖ Type errors:\n${(err as { stdout?: string })?.stdout ?? String(err)}` }] };
        }
      }

      case "get_env_vars": {
        const envPath = join(ROOT, ".env.example");
        if (!existsSync(envPath)) {
          return { content: [{ type: "text", text: ".env.example not found" }] };
        }
        const content = readFileSync(envPath, "utf-8");
        // Redact values
        const redacted = content.replace(/=.+/gm, "=<hidden>");
        return { content: [{ type: "text", text: redacted }] };
      }

      case "get_project_structure": {
        const claudeMd = join(ROOT, "CLAUDE.md");
        if (existsSync(claudeMd)) {
          const content = readFileSync(claudeMd, "utf-8");
          const structureSection = content.match(/## Monorepo Structure[\s\S]*?(?=---)/)?.[0] ?? "";
          return { content: [{ type: "text", text: structureSection }] };
        }
        return { content: [{ type: "text", text: "See CLAUDE.md for project structure" }] };
      }

      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }] };
    }
  } catch (err: unknown) {
    return {
      content: [{ type: "text", text: `Error: ${String(err)}` }],
      isError: true,
    };
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("LaunchKit MCP Server running (stdio)");
