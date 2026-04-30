import type { Metadata } from "next";
import { AiChat } from "@/components/ai/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Wand2, ImageIcon, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "Chat with AI, summarize documents, generate content, and create images",
};

const AI_TEMPLATES = [
  {
    href: "/dashboard/ai",
    icon: MessageSquare,
    title: "Chat Assistant",
    description: "Multi-model chat with GPT-4o, Claude, and Gemini",
    cost: "1 credit/message",
    active: true,
  },
  {
    href: "/dashboard/ai/summarize",
    icon: FileText,
    title: "Document Summarizer",
    description: "Summarize any text: articles, reports, meeting notes",
    cost: "2 credits/summary",
    active: false,
  },
  {
    href: "/dashboard/ai/generate",
    icon: Wand2,
    title: "Content Generator",
    description: "Blog posts, emails, social posts, product descriptions",
    cost: "2 credits/generation",
    active: false,
  },
  {
    href: "/dashboard/ai/images",
    icon: ImageIcon,
    title: "Image Generator",
    description: "Create stunning images with DALL-E 3",
    cost: "10 credits/image",
    active: false,
  },
];

export default function AiChatPage() {
  return (
    <div className="space-y-6">
      {/* Template grid */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">AI Templates</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AI_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <Link key={template.href} href={template.href}>
                <Card
                  className={`h-full cursor-pointer transition-colors hover:border-primary/50 ${template.active ? "border-primary bg-primary/5" : ""}`}
                >
                  <CardContent className="p-4">
                    <Icon className={`mb-2 h-5 w-5 ${template.active ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm font-medium">{template.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{template.cost}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      <div className="h-[calc(100vh-18rem)]">
        <AiChat />
      </div>
    </div>
  );
}
