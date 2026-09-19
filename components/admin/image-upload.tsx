"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/avif": "avif" };

/**
 * Upload an image to a public Supabase Storage bucket and store its URL in a form field.
 * The bucket enforces the real limits (size, MIME types, who may write); the checks here are for UX.
 */
export function ImageUpload({
  name,
  bucket = "covers",
  folder = "",
  defaultValue = "",
  maxBytes = 2 * 1024 * 1024,
  placeholder = "https://... (or upload an image)",
}: {
  name: string;
  bucket?: "covers" | "avatars";
  /** Path prefix inside the bucket. The avatars bucket requires "<user id>". */
  folder?: string;
  defaultValue?: string;
  maxBytes?: number;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    if (!ALLOWED.includes(file.type)) return setError("Use a PNG, JPEG, WebP or AVIF image.");
    if (file.size > maxBytes) return setError(`Image must be under ${Math.round(maxBytes / 1024 / 1024)} MB.`);

    setBusy(true);
    const supabase = createClient();
    const path = `${folder ? `${folder}/` : ""}${crypto.randomUUID()}.${EXT[file.type]}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
    });
    setBusy(false);
    if (uploadError) return setError("Upload failed. Check that you're allowed to upload here and try again.");
    setValue(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          name={name}
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          maxLength={2048}
        />
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose an image to upload"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <Button type="button" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()} className="shrink-0 gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          Upload
        </Button>
      </div>
      {value && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary user-provided URL */}
          <img src={value} alt="Preview" className="h-24 rounded-lg border border-border object-cover" />
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-border bg-background shadow"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
