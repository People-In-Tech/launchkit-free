"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadResult } from "@/components/upload-dropzone";

interface AvatarUploadProps {
  currentImageUrl?: string;
  onUpload?: (result: UploadResult) => void;
  onRemove?: () => void;
  onError?: (error: string) => void;
  size?: number;
  className?: string;
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  onError,
  size = 96,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const imageUrl = previewUrl || currentImageUrl;

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_AVATAR_SIZE) {
        onError?.("Image is too large. Maximum size is 5MB.");
        return;
      }

      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError?.("Invalid file type. Use JPEG, PNG, or WebP.");
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
        const message = err instanceof Error ? err.message : "Upload failed";
        onError?.(message);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onError],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove?.();
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className="relative cursor-pointer overflow-hidden rounded-full border-2 border-muted bg-muted"
        style={{ width: size, height: size }}
        onClick={() => inputRef.current?.click()}
      >
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Camera className="h-6 w-6" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </div>
      </div>

      {imageUrl && !isUploading && (
        <button
          onClick={handleRemove}
          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
