"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";

export interface ImageEntry {
  url: string;
  altText: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback(
    (newEntries: ImageEntry[]) => {
      const updated = [...images];
      for (const entry of newEntries) {
        // If no images exist yet, make the first one primary
        if (updated.length === 0 && !entry.isPrimary) {
          entry.isPrimary = true;
        }
        updated.push(entry);
      }
      onChange(updated);
    },
    [images, onChange]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      setError("");

      const entries: ImageEntry[] = [];
      const failed: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/admin/media/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json().catch(() => ({}));

          if (!res.ok || !data.url) {
            // A failed upload used to be kept as a blob: URL so there was
            // something to look at. That URL dies with the tab, and was then
            // saved to the product as a link to nothing. Better to say so.
            failed.push(`${file.name}: ${data.error || res.statusText || "upload failed"}`);
            continue;
          }

          entries.push({
            url: data.url,
            altText: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
            isPrimary: false,
          });
        } catch (cause) {
          failed.push(`${file.name}: ${(cause as Error).message}`);
        }
      }

      if (entries.length > 0) addImages(entries);
      if (failed.length > 0) setError(failed.join(" · "));
      setUploading(false);
    },
    [addImages]
  );

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const setPrimary = (index: number) => {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const updateAltText = (index: number, altText: string) => {
    onChange(images.map((img, i) => (i === index ? { ...img, altText } : img)));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-outline-variant/30 hover:border-primary"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2 block">
          cloud_upload
        </span>
        <p className="font-label text-sm text-on-surface-variant">
          {uploading
            ? "Uploading..."
            : "Drag & drop images here, or click to browse"}
        </p>
        <p className="font-label text-xs text-on-surface-variant/60 mt-1">
          PNG, JPG, WebP up to 5MB each
        </p>
      </div>

      {error && (
        <p className="bg-red-50 text-red-900 px-3 py-2 rounded-lg font-body text-xs">
          <span className="material-symbols-outlined text-[14px] align-middle mr-1">error</span>
          {error}
        </p>
      )}

      {/* Image list */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {images.map((img, i) => (
            <div
              key={`${img.url}-${i}`}
              className={`rounded-xl border bg-surface-container-low/50 overflow-hidden transition ${
                img.isPrimary
                  ? "border-primary ring-1 ring-primary/30"
                  : "border-outline-variant/20"
              }`}
            >
              <div className="flex gap-3 p-3">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-low flex-shrink-0">
                  {/* A thumbnail of a file uploaded seconds ago, behind the
                      admin login. Nothing to gain from the optimiser here. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.altText}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Alt text input */}
                  <input
                    type="text"
                    value={img.altText}
                    onChange={(e) => updateAltText(i, e.target.value)}
                    placeholder="Alt text..."
                    className="w-full px-2 py-1 rounded border border-outline-variant/20 bg-transparent font-body text-xs outline-none focus:border-primary transition"
                  />

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    {/* Set as Primary */}
                    <button
                      type="button"
                      onClick={() => setPrimary(i)}
                      title={img.isPrimary ? "Primary image" : "Set as primary"}
                      className={`p-1 rounded transition ${
                        img.isPrimary
                          ? "text-primary"
                          : "text-on-surface-variant/40 hover:text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {img.isPrimary ? "star" : "star_outline"}
                      </span>
                    </button>

                    {/* Move up */}
                    <button
                      type="button"
                      onClick={() => moveImage(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                      className="p-1 rounded text-on-surface-variant/40 hover:text-on-surface disabled:opacity-30 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_upward
                      </span>
                    </button>

                    {/* Move down */}
                    <button
                      type="button"
                      onClick={() => moveImage(i, 1)}
                      disabled={i === images.length - 1}
                      title="Move down"
                      className="p-1 rounded text-on-surface-variant/40 hover:text-on-surface disabled:opacity-30 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_downward
                      </span>
                    </button>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      title="Remove image"
                      className="p-1 rounded text-on-surface-variant/40 hover:text-red-500 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        close
                      </span>
                    </button>
                  </div>

                  {img.isPrimary && (
                    <span className="inline-block bg-primary text-on-primary text-[10px] font-label px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
