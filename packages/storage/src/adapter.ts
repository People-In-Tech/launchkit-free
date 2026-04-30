export interface StorageAdapter {
  upload(key: string, file: Buffer | ReadableStream, contentType: string): Promise<UploadResult>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<StorageObject[]>;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

export interface StorageObject {
  key: string;
  size: number;
  lastModified: Date;
}
