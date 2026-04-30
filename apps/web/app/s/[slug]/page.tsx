// @ts-nocheck
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@launchkit/database";
import { seoPages } from "@launchkit/database";
import { eq, and } from "drizzle-orm";
import { SeoLandingPage } from "@/components/seo/seo-landing-page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const [page] = await db
    .select()
    .from(seoPages)
    .where(and(eq(seoPages.slug, slug), eq(seoPages.published, true)))
    .limit(1);

  if (!page) {
    return { title: "Not Found" };
  }

  const metadata = page.seoMetadata as {
    ogImage?: string;
    canonicalUrl?: string;
  } | null;

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      ...(metadata?.ogImage ? { images: [metadata.ogImage] } : {}),
    },
    ...(metadata?.canonicalUrl
      ? { alternates: { canonical: metadata.canonicalUrl } }
      : {}),
  };
}

export default async function SeoPage({ params }: PageProps) {
  const { slug } = await params;

  const [page] = await db
    .select()
    .from(seoPages)
    .where(and(eq(seoPages.slug, slug), eq(seoPages.published, true)))
    .limit(1);

  if (!page) {
    notFound();
  }

  const seoMeta = page.seoMetadata as {
    structuredData?: Record<string, unknown>;
  } | null;

  return (
    <SeoLandingPage
      title={page.title}
      description={page.description}
      body={page.body}
      slug={page.slug}
      structuredData={seoMeta?.structuredData}
    />
  );
}
