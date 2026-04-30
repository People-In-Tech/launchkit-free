// @ts-nocheck
import { db } from "@launchkit/database";
import { seoTemplates, seoPages } from "@launchkit/database";
import { desc, eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SeoTemplatesPage() {
  const templates = await db
    .select()
    .from(seoTemplates)
    .orderBy(desc(seoTemplates.createdAt));

  // Get page counts per template
  const pageCounts = await db
    .select({
      templateId: seoPages.templateId,
      count: count(),
    })
    .from(seoPages)
    .groupBy(seoPages.templateId);

  const pageCountMap = new Map(
    pageCounts.map((pc) => [pc.templateId, pc.count])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Templates</h1>
          <p className="text-muted-foreground">
            Manage your programmatic SEO page templates.
          </p>
        </div>
        <Link
          href="/admin/seo/templates/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No templates yet. Create your first SEO template to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pattern: <code className="bg-muted px-1 rounded">{template.slugPattern}</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={template.enabled ? "default" : "secondary"}>
                    {template.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Variables:{" "}
                    {(template.variables as string[]).map((v) => (
                      <code key={v} className="bg-muted px-1 rounded mx-0.5">
                        {`{${v}}`}
                      </code>
                    ))}
                  </span>
                  <span>{pageCountMap.get(template.id) ?? 0} pages</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
