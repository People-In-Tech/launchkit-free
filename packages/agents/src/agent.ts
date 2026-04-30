/**
 * LaunchKit Agent Framework
 * Core agent definitions, configurations, and tool registry.
 */
import { searchTool } from "./tools/search";
import { fetchUrlTool } from "./tools/fetch-url";
import { codeTool, scaffoldTool } from "./tools/code";

// ── Tool registry ─────────────────────────────────────────────────────────────

export const TOOL_REGISTRY = {
  search: searchTool,
  "fetch-url": fetchUrlTool,
  code: codeTool,
  scaffold: scaffoldTool,
} as const;

export type ToolName = keyof typeof TOOL_REGISTRY;

// ── Agent config ──────────────────────────────────────────────────────────────

export interface AgentConfig {
  /** Model ID — resolved via getModel() in the calling route */
  modelId?: string;
  /** Tool names to enable */
  tools?: ToolName[];
  /** System prompt — appended after the base LaunchKit prompt */
  systemPrompt?: string;
  /** Enable pgvector memory (remembers past interactions) */
  memory?: boolean;
  /** Max tool call rounds before stopping (default 10) */
  maxSteps?: number;
}
