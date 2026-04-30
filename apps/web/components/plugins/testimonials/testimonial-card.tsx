import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  name: string;
  role?: string | null;
  company?: string | null;
  content: string;
  avatarUrl?: string | null;
  rating: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TestimonialCard({
  name,
  role,
  company,
  content,
  avatarUrl,
  rating,
}: TestimonialCardProps) {
  return (
    <Card className="break-inside-avoid">
      <CardContent className="p-6">
        {/* Star rating */}
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted"
              )}
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-sm leading-relaxed mb-4">
          &ldquo;{content}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {getInitials(name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium leading-none">{name}</p>
            {(role || company) && (
              <p className="text-xs text-muted-foreground mt-1">
                {[role, company].filter(Boolean).join(" at ")}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
