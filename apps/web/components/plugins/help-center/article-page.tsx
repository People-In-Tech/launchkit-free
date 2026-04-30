import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ArticleData {
  id: number;
  title: string;
  slug: string;
  content: string;
  updatedAt: Date;
}

interface ArticlePageProps {
  article: ArticleData;
}

export function ArticlePage({ article }: ArticlePageProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(article.updatedAt));

  const paragraphs = article.content.split("\n").filter((p) => p.trim());

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/help"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Help Center
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{article.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated {formattedDate}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
