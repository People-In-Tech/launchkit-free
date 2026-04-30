// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createStorageAdapter } from '@launchkit/storage';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
]);

/**
 * POST /api/upload — Upload a file to the configured storage provider.
 *
 * Storage provider is set via STORAGE_PROVIDER env var (launchkit.config.ts).
 * Supported: vercel-blob | s3 | gcs | azure-blob | supabase
 *
 * Body: multipart/form-data with a `file` field.
 * Returns: { key, url, size }
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `File type not allowed: ${file.type}` },
      { status: 400 },
    );
  }

  const ext = file.name.split('.').pop() || 'bin';
  const key = `uploads/${userId}/${randomUUID()}.${ext}`;

  const storage = createStorageAdapter();
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await storage.upload(key, buffer, file.type);

  return NextResponse.json(result);
}

/**
 * GET /api/upload?key=uploads/... — Get a signed URL for a private file.
 * Returns: { url, expiresAt }
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key || !key.startsWith(`uploads/${userId}/`)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  const expiresIn = 3600; // 1 hour
  const storage = createStorageAdapter();
  const url = await storage.getSignedUrl(key, expiresIn);

  return NextResponse.json({
    url,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  });
}

/**
 * DELETE /api/upload — Delete a file.
 * Body: { key: string }
 */
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { key } = (await request.json()) as { key: string };

  if (!key || !key.startsWith(`uploads/${userId}/`)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  const storage = createStorageAdapter();
  await storage.delete(key);

  return NextResponse.json({ success: true });
}
