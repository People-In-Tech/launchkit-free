import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChangelogEntryProps {
  entry: {
    id: number;
    title: string;
    slug: string;
    content: string;
    version: string | null;
    publishedAt: Date | null;
  };
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function ChangelogEntry({ entry }: ChangelogEntryProps) {
  const paragraphs = entry.content.split("\n").filter((p) => p.trim() !== "");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          {entry.version && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              v{entry.version}
            </span>
          )}
          {entry.publishedAt && (
            <span className="text-sm text-muted-foreground">
              {formatDate(entry.publishedAt)}
            </span>
          )}
        </div>
        <CardTitle>{entry.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
