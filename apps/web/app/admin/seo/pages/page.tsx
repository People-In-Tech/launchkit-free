// @ts-nocheck
import { db } from "@launchkit/database";
import { seoPages, seoTemplates } from "@launchkit/database";
import { desc } from "drizzle-orm";
import { SeoPageList } from "@/components/admin/seo-page-list";
import { SeoGenerateDialog } from "@/components/admin/seo-generate-dialog";

export const dynamic = "force-dynamic";

export default async function SeoPagesAdminPage() {
  const pages = await db
    .select()
    .from(seoPages)
    .orderBy(desc(seoPages.createdAt));

  const templates = await db
    .select()
    .from(seoTemplates)
    .orderBy(desc(seoTemplates.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Pages</h1>
          <p className="text-muted-foreground">
            Manage generated SEO pages. Publish or unpublish pages to control visibility.
          </p>
        </div>
        <SeoGenerateDialog
          templates={templates.map((t) => ({
            id: t.id,
            name: t.name,
            variables: t.variables as string[],
            slugPattern: t.slugPattern,
          }))}
        />
      </div>

      <SeoPageList initialPages={pages} />
    </div>
  );
}
