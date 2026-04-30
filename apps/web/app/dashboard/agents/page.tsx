"use client";
// @ts-nocheck

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Bot,
  Send,
  Wrench,
  Loader2,
  Search,
  Globe,
  Code2,
  FolderPlus,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AVAILABLE_TOOLS = [
  { id: "search", label: "Web Search", icon: Search, description: "Search the internet for current info" },
  { id: "fetch-url", label: "Read URL", icon: Globe, description: "Fetch and read any URL content" },
  { id: "code", label: "Code Analysis", icon: Code2, description: "Analyze, review, and explain code" },
  { id: "scaffold", label: "Scaffold Module", icon: FolderPlus, description: "Generate CRUD modules" },
];

const PRESET_AGENTS = [
  {
    name: "Code Reviewer",
    modelId: "claude-sonnet-4-6",
    tools: ["code", "fetch-url"],
    systemPrompt: "You are an expert code reviewer. Analyze code for bugs, security issues, performance problems, and style. Provide specific, actionable feedback.",
  },
  {
    name: "Research Assistant",
    modelId: "gpt-5.4-mini",
    tools: ["search", "fetch-url"],
    systemPrompt: "You are a research assistant. Find accurate, up-to-date information from the web. Always cite your sources.",
  },
  {
    name: "LaunchKit Builder",
    modelId: "claude-sonnet-4-6",
    tools: ["scaffold", "code", "fetch-url"],
    systemPrompt: "You are a LaunchKit expert. Help scaffold modules, review code, and guide developers through building features with the LaunchKit stack.",
  },
];

const MODELS = [
  "gpt-5.4-mini", "gpt-5.4", "claude-sonnet-4-6", "claude-opus-4-6",
  "gemini-3.1-flash", "gemini-3.1-pro", "sonar-pro",
];

export default function AgentsPage() {
  const [modelId, setModelId] = useState("gpt-5.4-mini");
  const [tools, setTools] = useState<string[]>(["search", "code"]);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a LaunchKit AI Agent — an expert full-stack engineer. Help developers build faster with the LaunchKit stack."
  );
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/ai/agent",
    body: { modelId, tools, systemPrompt },
    onError: (err) => toast.error(err.message ?? "Agent error"),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function toggleTool(toolId: string) {
    setTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  }

  function loadPreset(preset: typeof PRESET_AGENTS[0]) {
    setModelId(preset.modelId);
    setTools(preset.tools);
    setSystemPrompt(preset.systemPrompt);
    setActivePreset(preset.name);
    setMessages([]);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Config panel */}
      <div
        className={cn(
          "border-r bg-muted/20 flex flex-col transition-all duration-300",
          showConfig ? "w-80 min-w-[280px]" : "w-0 overflow-hidden"
        )}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Agent Config</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowConfig(false)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Preset agents */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Presets</p>
            {PRESET_AGENTS.map((preset) => (
              <Button
                key={preset.name}
                variant={activePreset === preset.name ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start h-auto py-2 text-xs"
                onClick={() => loadPreset(preset)}
              >
                <Bot className="h-3.5 w-3.5 mr-2 shrink-0" />
                {preset.name}
              </Button>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Model picker */}
          <div className="space-y-2 mb-4">
            <Label className="text-xs">Model</Label>
            <Select value={modelId} onValueChange={setModelId}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tools */}
          <div className="space-y-2 mb-4">
            <Label className="text-xs">Tools</Label>
            <div className="space-y-2">
              {AVAILABLE_TOOLS.map((tool) => (
                <div key={tool.id} className="flex items-start gap-2">
                  <Checkbox
                    id={tool.id}
                    checked={tools.includes(tool.id)}
                    onCheckedChange={() => toggleTool(tool.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor={tool.id} className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                      <tool.icon className="h-3 w-3" />
                      {tool.label}
                    </Label>
                    <p className="text-[10px] text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System prompt */}
          <div className="space-y-1.5">
            <Label className="text-xs">System Prompt</Label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="text-xs min-h-[100px] resize-none"
              placeholder="You are..."
            />
          </div>
        </div>

        <div className="p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => setMessages([])}
          >
            <RotateCcw className="h-3 w-3" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center gap-3">
          {!showConfig && (
            <Button variant="ghost" size="sm" onClick={() => setShowConfig(true)}>
              <Wrench className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {activePreset ?? "Custom Agent"}
              </p>
              <p className="text-xs text-muted-foreground">
                {modelId} · {tools.length} tool{tools.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {tools.map((t) => {
            const tool = AVAILABLE_TOOLS.find((a) => a.id === t);
            if (!tool) return null;
            return (
              <Badge key={t} variant="secondary" className="text-[10px] gap-1 hidden sm:flex">
                <tool.icon className="h-2.5 w-2.5" />
                {tool.label}
              </Badge>
            );
          })}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
                <Bot className="h-7 w-7 text-indigo-400" />
              </div>
              <div>
                <p className="font-medium">Agent Ready</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask anything — this agent can search the web, read URLs, analyze code, and scaffold modules.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  {m.role !== "user" && (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-3xl mx-auto"
          >
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask the agent anything..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
