import { cn } from "@/lib/utils";

interface ChangelogEntry {
  id: number;
  title: string;
  slug: string;
  content: string;
  version: string | null;
  publishedAt: Date | null;
}

interface ChangelogListProps {
  entries: ChangelogEntry[];
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function ChangelogList({ entries }: ChangelogListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No changelog entries yet.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="relative pl-8 border-l-2 border-border"
        >
          <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary" />
          <div className="mb-2">
            {entry.version && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5",
                  "text-xs font-medium text-primary mr-2"
                )}
              >
                v{entry.version}
              </span>
            )}
            {entry.publishedAt && (
              <span className="text-sm text-muted-foreground">
                {formatDate(entry.publishedAt)}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold mb-3">{entry.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {entry.content.length > 200
              ? entry.content.slice(0, 200) + "..."
              : entry.content}
          </p>
        </div>
      ))}
    </div>
  );
}
