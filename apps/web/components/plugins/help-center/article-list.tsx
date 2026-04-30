import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Article {
  id: number;
  title: string;
  slug: string;
  categoryId: number | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface ArticleListProps {
  articles: Article[];
  categories: Category[];
}

export function ArticleList({ articles, categories }: ArticleListProps) {
  const grouped = categories.map((category) => ({
    category,
    articles: articles.filter((a) => a.categoryId === category.id),
  }));

  const uncategorized = articles.filter((a) => a.categoryId === null);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {grouped.map(
        ({ category, articles: catArticles }) =>
          catArticles.length > 0 && (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {category.icon && (
                    <span className="mr-2">{category.icon}</span>
                  )}
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {catArticles.map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/help/${article.slug}`}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
      )}

      {uncategorized.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {uncategorized.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/help/${article.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
