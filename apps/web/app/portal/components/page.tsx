import { PortalItemCard } from "@/components/portal/item-card";
import { Box, Layout, MousePointerClick } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ComponentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Components & UI Kits</h1>
        <p className="mt-2 text-muted-foreground">
          Premium UI blocks, layouts, and interactive components built on shadcn/ui.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PortalItemCard
          title="Marketing UI Kit"
          description="30+ sections for high-converting landing pages. Hero sections, feature grids, pricing tables, and complex footers."
          status="coming_soon"
          icon={<Layout className="h-5 w-5" />}
          tags={["Marketing", "Tailwind"]}
        />
        
        <PortalItemCard
          title="Interactive Animations Kit"
          description="Framer Motion recipes for stunning scroll reveals, micro-interactions, and complex multi-step transitions."
          status="coming_soon"
          icon={<MousePointerClick className="h-5 w-5" />}
          tags={["Framer Motion", "Animations"]}
        />
        
        <PortalItemCard
          title="Dashboard Blocks"
          description="Complex data tables with filtering, advanced charting layouts, and dense admin panels."
          status="coming_soon"
          icon={<Box className="h-5 w-5" />}
          tags={["Admin", "Data"]}
        />
      </div>
    </div>
  );
}
