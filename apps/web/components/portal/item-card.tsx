import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowRight, Download, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  title: string;
  description: string;
  status: "owned" | "available" | "coming_soon";
  price?: number;
  icon?: React.ReactNode;
  tags?: string[];
  actionLink?: string;
  highlight?: boolean;
}

export function PortalItemCard({
  title,
  description,
  status,
  price,
  icon,
  tags,
  actionLink,
  highlight
}: ItemCardProps) {
  return (
    <Card className={cn("flex flex-col h-full", highlight && "border-primary/40 shadow-lg shadow-primary/5")}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary mb-3">
            {icon || <Sparkles className="h-5 w-5" />}
          </div>
          {status === "owned" && <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 border-green-200 dark:border-green-800">Owned</Badge>}
          {status === "coming_soon" && <Badge variant="secondary">Coming Soon</Badge>}
          {status === "available" && price !== undefined && <Badge variant="outline" className="font-semibold">${price}</Badge>}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4 border-t mt-auto">
        {status === "owned" ? (
          <Button asChild className="w-full gap-2" variant="outline">
            <Link href={actionLink || "#"}>
              <Download className="h-4 w-4" /> Access Item
            </Link>
          </Button>
        ) : status === "available" ? (
          <form action="/api/billing/checkout" method="POST" className="w-full">
            <input type="hidden" name="productId" value={title.toLowerCase().replace(/\s+/g, '-')} />
            <Button type="submit" className="w-full gap-2">
              Purchase <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Button disabled className="w-full gap-2" variant="secondary">
            <Lock className="h-4 w-4" /> Not Yet Available
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
