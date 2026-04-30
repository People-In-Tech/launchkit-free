// @ts-nocheck
import type { MetadataRoute } from "next";
import { db } from "@launchkit/database";
import { seoPages } from "@launchkit/database";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const pages = await db
      .select({
        slug: seoPages.slug,
        updatedAt: seoPages.updatedAt,
      })
      .from(seoPages)
      .where(eq(seoPages.published, true));

    return pages.map((page) => ({
      url: `/s/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}
