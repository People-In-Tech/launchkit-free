import type { StorageAdapter, UploadResult, StorageObject } from '../adapter';

/**
 * Supabase Storage adapter.
 *
 * Required env vars:
 *   SUPABASE_URL            — project URL (e.g. https://xyz.supabase.co)
 *   SUPABASE_SERVICE_KEY    — service-role key for server-side operations
 *   STORAGE_BUCKET          — Supabase storage bucket name
 */
export class SupabaseStorageAdapter implements StorageAdapter {
  private supabaseUrl: string;
  private serviceKey: string;
  private bucket: string;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL!;
    this.serviceKey = process.env.SUPABASE_SERVICE_KEY!;
    this.bucket = process.env.STORAGE_BUCKET!;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.serviceKey}`,
      apikey: this.serviceKey,
    };
  }

  private storageUrl(path: string): string {
    return `${this.supabaseUrl}/storage/v1${path}`;
  }

  async upload(
    key: string,
    file: Buffer | ReadableStream,
    contentType: string,
  ): Promise<UploadResult> {
    // Convert file to ArrayBuffer for the fetch body
    let size: number;
    let fetchBody: BodyInit;
    if (file instanceof Buffer) {
      size = file.byteLength;
      fetchBody = file as unknown as BodyInit;
    } else {
      const resp = new Response(file as unknown as BodyInit);
      const ab = await resp.arrayBuffer();
      size = ab.byteLength;
      fetchBody = ab;
    }

    const response = await fetch(
      this.storageUrl(`/object/${this.bucket}/${key}`),
      {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': contentType,
        },
        body: fetchBody,
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase upload failed: ${error}`);
    }

    return {
      key,
      url: `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${key}`,
      size,
    };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const response = await fetch(
      this.storageUrl(`/object/sign/${this.bucket}/${key}`),
      {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase signed URL failed: ${error}`);
    }

    const data = (await response.json()) as { signedURL: string };
    return `${this.supabaseUrl}/storage/v1${data.signedURL}`;
  }

  async delete(key: string): Promise<void> {
    const response = await fetch(
      this.storageUrl(`/object/${this.bucket}`),
      {
        method: 'DELETE',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefixes: [key] }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase delete failed: ${error}`);
    }
  }

  async list(prefix: string): Promise<StorageObject[]> {
    const response = await fetch(
      this.storageUrl(`/object/list/${this.bucket}`),
      {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prefix,
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase list failed: ${error}`);
    }

    const data = (await response.json()) as Array<{
      name: string;
      metadata: { size: number };
      updated_at: string;
    }>;

    return data.map((obj) => ({
      key: `${prefix}${obj.name}`,
      size: obj.metadata?.size ?? 0,
      lastModified: new Date(obj.updated_at),
    }));
  }
}
