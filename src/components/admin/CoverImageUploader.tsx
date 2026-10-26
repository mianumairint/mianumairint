"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface CoverImageUploaderProps {
  imageUrl: string;
  onChange: (url: string) => void;
}

export default function CoverImageUploader({ imageUrl, onChange }: CoverImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Set when the stored URL will not survive a redeploy, so the editor can say so.
  const [storageWarning, setStorageWarning] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    setStorageWarning("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        if (data.persistent === false) {
          setStorageWarning(data.warning || "This upload is not stored persistently.");
        }
      } else {
        // Fallback to data URL
        const reader = new FileReader();
        reader.onload = () => onChange(reader.result as string);
        reader.readAsDataURL(file);
        setStorageWarning(
          "Upload failed, so the image was embedded directly in the page content. Configure Supabase Storage and re-upload before publishing."
        );
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
      setStorageWarning(
        "Upload failed, so the image was embedded directly in the page content. Configure Supabase Storage and re-upload before publishing."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-3">
      <label className="font-label text-sm font-medium text-on-surface">Cover Image</label>

      {storageWarning && (
        <p className="bg-amber-50 text-amber-900 px-3 py-2 rounded-lg font-body text-xs">
          <span className="material-symbols-outlined text-[14px] align-middle mr-1">warning</span>
          {storageWarning}
        </p>
      )}

      {imageUrl ? (
        <div className="relative rounded-xl overflow-hidden group">
          <div className="relative w-full h-48">
            <Image src={imageUrl} alt="Cover preview" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-on-surface font-label text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/90"
            >
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">swap_horiz</span>
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-error text-on-error font-label text-xs font-semibold px-4 py-2 rounded-lg hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">delete</span>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-low"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="font-label text-xs text-on-surface-variant">Uploading...</p>
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">cloud_upload</span>
              <p className="font-label text-sm text-on-surface-variant">
                Drag & drop image here
              </p>
              <p className="font-label text-xs text-on-surface-variant/60 mt-1">
                or click to browse (JPG, PNG, WebP)
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
