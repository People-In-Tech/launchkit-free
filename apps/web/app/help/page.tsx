// @ts-nocheck
import { HelpSearch } from "@/components/plugins/help-center/help-search";
import { ArticleList } from "@/components/plugins/help-center/article-list";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const { db } = await import("@launchkit/database");
    const { helpArticles, helpCategories } = await import("@launchkit/database");
    const { eq, asc } = await import("drizzle-orm");

    const categories = await db
      .select()
      .from(helpCategories)
      .orderBy(asc(helpCategories.order));

    const articles = await db
      .select({
        id: helpArticles.id,
        title: helpArticles.title,
        slug: helpArticles.slug,
        categoryId: helpArticles.categoryId,
      })
      .from(helpArticles)
      .where(eq(helpArticles.published, true))
      .orderBy(asc(helpArticles.title));

    return { categories, articles };
  } catch {
    return { categories: [], articles: [] };
  }
}

export default async function HelpCenterPage() {
  const { categories, articles } = await getData();

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and learn how to get the most out of
          our platform.
        </p>
      </div>

      <HelpSearch />

      <ArticleList articles={articles} categories={categories} />
    </div>
  );
}
