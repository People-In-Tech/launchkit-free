import { put, del, list as blobList } from '@vercel/blob';
import type { StorageAdapter, UploadResult, StorageObject } from '../adapter';

/**
 * Vercel Blob Storage adapter.
 * The simplest option — zero config beyond a token.
 *
 * Required env vars:
 *   BLOB_READ_WRITE_TOKEN — Vercel Blob token (auto-set in Vercel projects)
 *
 * Note: Vercel Blob doesn't use buckets/containers. All objects are namespaced
 * by your token. The `prefix` arg on list() filters by pathname prefix.
 *
 * Signed URLs: Vercel Blob URLs are unguessable by default. getSignedUrl()
 * returns the same URL — add `access: 'private'` to uploads if you need
 * token-gated access (requires Vercel Pro+).
 */
export class VercelBlobStorageAdapter implements StorageAdapter {
  async upload(
    key: string,
    file: Buffer | ReadableStream,
    contentType: string,
  ): Promise<UploadResult> {
    let body: Buffer;
    if (file instanceof Buffer) {
      body = file;
    } else {
      const response = new Response(file as unknown as BodyInit);
      body = Buffer.from(await response.arrayBuffer());
    }

    const result = await put(key, body, {
      access: 'public',
      contentType,
    });

    return {
      key,
      url: result.url,
      size: body.byteLength,
    };
  }

  async getSignedUrl(key: string, _expiresIn?: number): Promise<string> {
    // Vercel Blob public URLs are stable and unguessable — no signing needed
    // For private blobs, use downloadUrl from the put() result
    return `https://blob.vercel-storage.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    await del(`https://blob.vercel-storage.com/${key}`);
  }

  async list(prefix: string): Promise<StorageObject[]> {
    const { blobs } = await blobList({ prefix });
    return blobs.map((b) => ({
      key: b.pathname,
      size: b.size,
      lastModified: new Date(b.uploadedAt),
    }));
  }
}
