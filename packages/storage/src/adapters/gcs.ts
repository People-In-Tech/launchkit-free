import { Storage } from '@google-cloud/storage';
import type { StorageAdapter, UploadResult, StorageObject } from '../adapter';

/**
 * Google Cloud Storage adapter.
 * Works with any GCS bucket.
 *
 * Required env vars:
 *   GCS_BUCKET               — bucket name
 *   GCS_PROJECT_ID           — GCP project ID
 *
 * Authentication (one of):
 *   GCS_CREDENTIALS_JSON     — base64-encoded service account JSON (recommended for Vercel/Railway)
 *   GOOGLE_APPLICATION_CREDENTIALS — path to service account JSON file (local / Cloud Run)
 *   (if neither set, uses Application Default Credentials — works on GCE/Cloud Run w/ Workload Identity)
 *
 * Optional:
 *   STORAGE_PUBLIC_URL       — public CDN base URL (e.g. https://cdn.example.com)
 */
export class GCSStorageAdapter implements StorageAdapter {
  private storage: Storage;
  private bucket: string;
  private publicUrl: string | undefined;

  constructor() {
    this.bucket = process.env.GCS_BUCKET!;
    this.publicUrl = process.env.STORAGE_PUBLIC_URL;

    const credentialsJson = process.env.GCS_CREDENTIALS_JSON;
    if (credentialsJson) {
      const credentials = JSON.parse(
        Buffer.from(credentialsJson, 'base64').toString('utf-8')
      );
      this.storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        credentials,
      });
    } else {
      // Falls back to GOOGLE_APPLICATION_CREDENTIALS env var or ADC
      this.storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
      });
    }
  }

  async upload(
    key: string,
    file: Buffer | ReadableStream,
    contentType: string,
  ): Promise<UploadResult> {
    const bucket = this.storage.bucket(this.bucket);
    const gcsFile = bucket.file(key);

    let body: Buffer;
    if (file instanceof Buffer) {
      body = file;
    } else {
      const response = new Response(file as unknown as BodyInit);
      body = Buffer.from(await response.arrayBuffer());
    }

    await gcsFile.save(body, {
      metadata: { contentType },
      resumable: false,
    });

    const url = this.publicUrl
      ? `${this.publicUrl}/${key}`
      : `https://storage.googleapis.com/${this.bucket}/${key}`;

    return { key, url, size: body.byteLength };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const [url] = await this.storage
      .bucket(this.bucket)
      .file(key)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });
    return url;
  }

  async delete(key: string): Promise<void> {
    await this.storage.bucket(this.bucket).file(key).delete({ ignoreNotFound: true });
  }

  async list(prefix: string): Promise<StorageObject[]> {
    const [files] = await this.storage.bucket(this.bucket).getFiles({ prefix });
    return files.map((f) => ({
      key: f.name,
      size: Number(f.metadata.size ?? 0),
      lastModified: new Date(f.metadata.updated ?? Date.now()),
    }));
  }
}
