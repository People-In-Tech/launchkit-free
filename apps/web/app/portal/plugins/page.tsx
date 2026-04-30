import { PortalItemCard } from "@/components/portal/item-card";
import { Blocks, MessageSquare, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PluginsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plugins & Add-ons</h1>
        <p className="mt-2 text-muted-foreground">
          Premium integrations and specialized modules to drop into your LaunchKit codebase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PortalItemCard
          title="Advanced AI Image Gen"
          description="Drop-in module supporting DALL-E 3, Flux, and Stable Diffusion. Includes credits tracking, gallery UI, and image variations."
          status="coming_soon"
          icon={<ImageIcon className="h-5 w-5" />}
          tags={["AI", "Images", "Credits"]}
        />
        
        <PortalItemCard
          title="In-App Community Forum"
          description="A complete threaded forum plugin with moderation tools, upvoting, rich text editor, and notification syncing."
          status="coming_soon"
          icon={<MessageSquare className="h-5 w-5" />}
          tags={["Community", "Social"]}
        />
        
        <PortalItemCard
          title="Custom MCP Tool Builder"
          description="Visual builder for Model Context Protocol tools. Define endpoints, schemas, and descriptions without writing boilerplate."
          status="coming_soon"
          icon={<Blocks className="h-5 w-5" />}
          tags={["MCP", "Agents", "DevTools"]}
        />
      </div>
    </div>
  );
}
