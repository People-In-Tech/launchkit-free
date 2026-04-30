import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { StorageAdapter, UploadResult, StorageObject } from '../adapter';

/**
 * S3-compatible storage adapter.
 * Works with AWS S3, Cloudflare R2, MinIO, and any S3-compatible provider.
 *
 * Required env vars:
 *   STORAGE_BUCKET          — bucket name
 *   STORAGE_ACCESS_KEY_ID   — IAM access key
 *   STORAGE_SECRET_ACCESS_KEY — IAM secret
 *   STORAGE_PUBLIC_URL      — public base URL for uploaded objects
 *
 * Optional:
 *   STORAGE_REGION   — AWS region (default: "auto", used by R2)
 *   STORAGE_ENDPOINT — custom endpoint for R2/MinIO
 */
export class S3StorageAdapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.STORAGE_BUCKET!;
    this.client = new S3Client({
      region: process.env.STORAGE_REGION || 'auto',
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: !!process.env.STORAGE_ENDPOINT,
    });
  }

  async upload(
    key: string,
    file: Buffer | ReadableStream,
    contentType: string,
  ): Promise<UploadResult> {
    let body: Uint8Array;
    if (file instanceof Buffer) {
      body = file;
    } else {
      const response = new Response(file as unknown as BodyInit);
      body = new Uint8Array(await response.arrayBuffer());
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return {
      key,
      url: `${process.env.STORAGE_PUBLIC_URL}/${key}`,
      size: body.byteLength,
    };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async list(prefix: string): Promise<StorageObject[]> {
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      }),
    );

    return (response.Contents ?? []).map((obj) => ({
      key: obj.Key!,
      size: obj.Size!,
      lastModified: obj.LastModified!,
    }));
  }
}
