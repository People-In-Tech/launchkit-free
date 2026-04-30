import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import type { StorageAdapter, UploadResult, StorageObject } from '../adapter';

/**
 * Azure Blob Storage adapter.
 *
 * Required env vars:
 *   AZURE_STORAGE_ACCOUNT     — storage account name (e.g. myaccount)
 *   AZURE_STORAGE_ACCOUNT_KEY — account access key
 *   AZURE_STORAGE_CONTAINER   — container name
 *
 * Optional:
 *   STORAGE_PUBLIC_URL        — public CDN base URL (e.g. https://cdn.example.com)
 *
 * Note: Container must exist and have the appropriate access policy set.
 *       For private files, signed URLs are used (getSignedUrl).
 *       For public files, set container access level to "Blob" and set STORAGE_PUBLIC_URL.
 */
export class AzureBlobStorageAdapter implements StorageAdapter {
  private client: BlobServiceClient;
  private credential: StorageSharedKeyCredential;
  private container: string;
  private account: string;
  private publicUrl: string | undefined;

  constructor() {
    this.account = process.env.AZURE_STORAGE_ACCOUNT!;
    this.container = process.env.AZURE_STORAGE_CONTAINER!;
    this.publicUrl = process.env.STORAGE_PUBLIC_URL;
    this.credential = new StorageSharedKeyCredential(
      this.account,
      process.env.AZURE_STORAGE_ACCOUNT_KEY!,
    );
    this.client = new BlobServiceClient(
      `https://${this.account}.blob.core.windows.net`,
      this.credential,
    );
  }

  private get containerClient() {
    return this.client.getContainerClient(this.container);
  }

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

    const blobClient = this.containerClient.getBlockBlobClient(key);
    await blobClient.uploadData(body, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    const url = this.publicUrl
      ? `${this.publicUrl}/${key}`
      : blobClient.url;

    return { key, url, size: body.byteLength };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const blobClient = this.containerClient.getBlockBlobClient(key);
    const expiresOn = new Date(Date.now() + expiresIn * 1000);

    const sasParams = generateBlobSASQueryParameters(
      {
        containerName: this.container,
        blobName: key,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn,
      },
      this.credential,
    );

    return `${blobClient.url}?${sasParams.toString()}`;
  }

  async delete(key: string): Promise<void> {
    await this.containerClient.getBlockBlobClient(key).deleteIfExists();
  }

  async list(prefix: string): Promise<StorageObject[]> {
    const objects: StorageObject[] = [];
    for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
      objects.push({
        key: blob.name,
        size: blob.properties.contentLength ?? 0,
        lastModified: blob.properties.lastModified ?? new Date(),
      });
    }
    return objects;
  }
}
