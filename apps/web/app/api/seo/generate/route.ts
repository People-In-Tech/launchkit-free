// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { seoTemplates, seoPages } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { renderTemplate, generateSlug, generateStructuredData } from "@/lib/seo";

export async function POST(request: Request) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { templateId, variableSets } = body as {
    templateId: string;
    variableSets: Record<string, string>[];
  };

  if (!templateId || !variableSets || !Array.isArray(variableSets) || variableSets.length === 0) {
    return NextResponse.json(
      { error: "templateId and variableSets array are required" },
      { status: 400 }
    );
  }

  const [template] = await db
    .select()
    .from(seoTemplates)
    .where(eq(seoTemplates.id, templateId))
    .limit(1);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const generated = [];
  const errors = [];

  for (const variables of variableSets) {
    try {
      const slug = generateSlug(template.slugPattern, variables);
      const title = renderTemplate(template.titleTemplate, variables);
      const description = renderTemplate(template.descriptionTemplate, variables);
      const pageBody = renderTemplate(template.bodyTemplate, variables);
      const structuredData = generateStructuredData({ title, description, slug });

      const [page] = await db
        .insert(seoPages)
        .values({
          templateId,
          slug,
          title,
          description,
          body: pageBody,
          variables,
          published: false,
          seoMetadata: { structuredData },
        })
        .returning();

      generated.push(page);
    } catch (error) {
      errors.push({
        variables,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    generated: generated.length,
    errors: errors.length,
    pages: generated,
    failedVariableSets: errors,
  });
}
