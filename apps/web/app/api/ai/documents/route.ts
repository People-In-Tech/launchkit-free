// @ts-nocheck
/**
 * API route: /api/ai/documents
 *
 * Manage documents in the RAG vector store.
 *
 * POST  — Upload and index a document (chunked + embedded)
 * GET   — List documents for the authenticated org
 * DELETE — Remove a document and all its chunks
 */

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@launchkit/database";
import { documents } from "@launchkit/database";
import { eq, and, isNull } from "drizzle-orm";
import { indexDocument, deleteDocument } from "@/lib/rag";
import { deductCredits, getCredits } from "@/lib/credits";

// ---------------------------------------------------------------------------
// POST — index a new document
// ---------------------------------------------------------------------------

const IndexDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = IndexDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { title, content, metadata } = parsed.data;
  const scopeId = orgId ?? userId; // Use org ID if available, else user ID

  // Estimate chunks to calculate credit cost
  const estimatedChunks = Math.ceil(content.length / 800);
  const creditCost = estimatedChunks; // 1 credit per chunk

  const balance = await getCredits(userId);
  if (balance < creditCost) {
    return Response.json(
      {
        error: `Insufficient credits. Indexing this document requires ~${creditCost} credits. You have ${balance}.`,
      },
      { status: 402 }
    );
  }

  try {
    await indexDocument(scopeId, title, content, {
      metadata: {
        ...metadata,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Deduct credits for embedding (1 per estimated chunk)
    await deductCredits(userId, creditCost, `Document embedding: ${title}`);

    return Response.json(
      {
        success: true,
        message: `Document "${title}" indexed successfully`,
        creditsUsed: creditCost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/ai/documents/POST]", error);
    return Response.json({ error: "Failed to index document" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET — list documents for the org
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scopeId = orgId ?? userId;

  try {
    // Only return parent documents (chunkIndex = 0 and parentDocumentId IS NULL)
    // This avoids returning every chunk as a separate item
    const rows = await db
      .select({
        id: documents.id,
        title: documents.title,
        chunkIndex: documents.chunkIndex,
        metadata: documents.metadata,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(
        and(
          eq(documents.organizationId, scopeId),
          isNull(documents.parentDocumentId)
        )
      );

    return Response.json({ data: rows });
  } catch (error) {
    console.error("[api/ai/documents/GET]", error);
    return Response.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — remove a document and all its chunks
// ---------------------------------------------------------------------------

export async function DELETE(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("id");

  if (!documentId) {
    return Response.json({ error: "Document ID is required (?id=...)" }, { status: 400 });
  }

  const scopeId = orgId ?? userId;

  // Verify ownership before deletion
  const doc = await db.query.documents.findFirst({
    where: and(
      eq(documents.id, documentId),
      eq(documents.organizationId, scopeId)
    ),
    columns: { id: true, title: true },
  });

  if (!doc) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    await deleteDocument(documentId);
    return Response.json({ success: true, message: `Document "${doc.title}" deleted` });
  } catch (error) {
    console.error("[api/ai/documents/DELETE]", error);
    return Response.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
