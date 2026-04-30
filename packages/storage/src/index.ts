export type {
  StorageAdapter,
  UploadResult,
  StorageObject,
} from './adapter';

export type { StorageProvider } from './adapters';
export { createStorageAdapter } from './adapters';

export { S3StorageAdapter } from './adapters/s3';
export { GCSStorageAdapter } from './adapters/gcs';
export { AzureBlobStorageAdapter } from './adapters/azure-blob';
export { VercelBlobStorageAdapter } from './adapters/vercel-blob';
export { SupabaseStorageAdapter } from './adapters/supabase';
