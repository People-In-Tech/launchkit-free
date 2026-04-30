// @ts-nocheck
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/plugins/help-center/article-page";

export const dynamic = "force-dynamic";

interface HelpArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { slug } = await params;

  try {
    const { db } = await import("@launchkit/database");
    const { helpArticles } = await import("@launchkit/database");
    const { and, eq } = await import("drizzle-orm");

    const results = await db
      .select({
        id: helpArticles.id,
        title: helpArticles.title,
        slug: helpArticles.slug,
        content: helpArticles.content,
        updatedAt: helpArticles.updatedAt,
      })
      .from(helpArticles)
      .where(and(eq(helpArticles.slug, slug), eq(helpArticles.published, true)))
      .limit(1);

    const article = results[0];

    if (!article) {
      notFound();
    }

    return (
      <div className="px-4 py-12">
        <ArticlePage article={article} />
      </div>
    );
  } catch {
    notFound();
  }
}
