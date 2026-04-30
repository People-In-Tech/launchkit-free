"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

interface UploadDropzoneProps {
  onUpload?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  accept?: string[];
  maxSize?: number;
  className?: string;
}

const DEFAULT_ACCEPT = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDropzone({
  onUpload,
  onError,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  className,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > maxSize) {
        onError?.(`File is too large. Maximum size is ${formatBytes(maxSize)}.`);
        return;
      }

      if (accept.length > 0 && !accept.includes(file.type)) {
        onError?.(`Invalid file type. Allowed types: ${accept.join(", ")}.`);
        return;
      }

      setFileName(file.name);

      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreview(url);
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = (await response.json()) as { error: string };
          throw new Error(data.error || "Upload failed");
        }

        const result = (await response.json()) as UploadResult;
        onUpload?.(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
        onError?.(message);
        setPreview(null);
        setFileName(null);
      } finally {
        setIsUploading(false);
      }
    },
    [accept, maxSize, onUpload, onError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const clearPreview = () => {
    setPreview(null);
    setFileName(null);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50",
        isUploading && "pointer-events-none opacity-60",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : preview ? (
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="h-24 w-24 rounded-md object-cover"
          />
          <p className="text-sm text-muted-foreground">{fileName}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              clearPreview();
            }}
          >
            <X className="mr-1 h-3 w-3" />
            Remove
          </Button>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center gap-3">
          <FileIcon className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{fileName}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              clearPreview();
            }}
          >
            <X className="mr-1 h-3 w-3" />
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground">
            Up to {formatBytes(maxSize)}
          </p>
        </div>
      )}
    </div>
  );
}
