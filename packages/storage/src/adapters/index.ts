import type { StorageAdapter } from '../adapter';
import { S3StorageAdapter } from './s3';
import { SupabaseStorageAdapter } from './supabase';
import { GCSStorageAdapter } from './gcs';
import { AzureBlobStorageAdapter } from './azure-blob';
import { VercelBlobStorageAdapter } from './vercel-blob';

/**
 * StorageProvider — configurable via STORAGE_PROVIDER env var or launchkit.config.ts.
 *
 *   s3          — AWS S3 (also compatible with Cloudflare R2, MinIO via STORAGE_ENDPOINT)
 *   gcs         — Google Cloud Storage
 *   azure-blob  — Azure Blob Storage
 *   vercel-blob — Vercel Blob (simplest, zero config on Vercel)
 *   supabase    — Supabase Storage
 */
export type StorageProvider = 's3' | 'gcs' | 'azure-blob' | 'vercel-blob' | 'supabase';

/**
 * Factory: returns a StorageAdapter for the configured provider.
 *
 * Resolution order:
 *   1. Explicit `provider` argument
 *   2. STORAGE_PROVIDER environment variable
 *   3. Default: 'vercel-blob' (zero-config on Vercel)
 */
export function createStorageAdapter(provider?: StorageProvider): StorageAdapter {
  const p: StorageProvider =
    provider ??
    (process.env.STORAGE_PROVIDER as StorageProvider | undefined) ??
    'vercel-blob';

  switch (p) {
    case 's3':
      return new S3StorageAdapter();
    case 'gcs':
      return new GCSStorageAdapter();
    case 'azure-blob':
      return new AzureBlobStorageAdapter();
    case 'vercel-blob':
      return new VercelBlobStorageAdapter();
    case 'supabase':
      return new SupabaseStorageAdapter();
    default:
      throw new Error(`Unknown storage provider: ${p as string}. Valid options: s3, gcs, azure-blob, vercel-blob, supabase`);
  }
}
