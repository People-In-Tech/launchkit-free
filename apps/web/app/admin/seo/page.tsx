// @ts-nocheck
import { db } from "@launchkit/database";
import { seoTemplates, seoPages } from "@launchkit/database";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe, Eye } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SeoAdminPage() {
  const templates = await db.select().from(seoTemplates);
  const allPages = await db.select().from(seoPages);
  const publishedPages = allPages.filter((p) => p.published);

  const stats = [
    { title: "Templates", value: templates.length, icon: FileText },
    { title: "Total Pages", value: allPages.length, icon: Globe },
    { title: "Published", value: publishedPages.length, icon: Eye },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO Pages</h1>
        <p className="text-muted-foreground">
          Manage programmatic SEO templates and generated pages.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/seo/templates">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and manage SEO page templates with variable placeholders.
              </p>
              <p className="text-sm font-medium mt-2">{templates.length} templates</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/seo/pages">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Generated Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View, publish, and manage generated SEO pages.
              </p>
              <p className="text-sm font-medium mt-2">
                {publishedPages.length} published / {allPages.length} total
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
