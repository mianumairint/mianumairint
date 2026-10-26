"use client";

import { useState } from "react";

const initialMedia = [
  { id: 1, name: "pink-salt-hero.jpg", url: "/uploads/pink-salt-hero.jpg", size: "2.4 MB" },
  { id: 2, name: "salt-lamp-medium.jpg", url: "/uploads/salt-lamp-medium.jpg", size: "1.8 MB" },
  { id: 3, name: "bath-salts-product.jpg", url: "/uploads/bath-salts-product.jpg", size: "1.2 MB" },
  { id: 4, name: "cooking-block.jpg", url: "/uploads/cooking-block.jpg", size: "2.1 MB" },
  { id: 5, name: "salt-mine-khewra.jpg", url: "/uploads/salt-mine-khewra.jpg", size: "3.5 MB" },
  { id: 6, name: "shot-glasses-set.jpg", url: "/uploads/shot-glasses-set.jpg", size: "980 KB" },
  { id: 7, name: "salt-wall-panel.jpg", url: "/uploads/salt-wall-panel.jpg", size: "2.8 MB" },
  { id: 8, name: "logo-dark.png", url: "/uploads/logo-dark.png", size: "45 KB" },
  { id: 9, name: "blog-health-benefits.jpg", url: "/uploads/blog-health-benefits.jpg", size: "1.6 MB" },
  { id: 10, name: "packaging-bulk.jpg", url: "/uploads/packaging-bulk.jpg", size: "2.2 MB" },
  { id: 11, name: "team-photo.jpg", url: "/uploads/team-photo.jpg", size: "3.1 MB" },
  { id: 12, name: "certificate-iso.pdf", url: "/uploads/certificate-iso.pdf", size: "520 KB" },
];

export default function MediaPage() {
  const [media, setMedia] = useState(initialMedia);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyUrl = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteMedia = (id: number) => {
    setMedia(media.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl text-on-surface">Media Library</h1>
        <button className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
          Upload Files
        </button>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-8 text-center hover:border-primary/50 transition cursor-pointer bg-surface-container-lowest">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">cloud_upload</span>
        <p className="font-label text-sm text-on-surface-variant">Drag & drop files here or click to browse</p>
        <p className="font-label text-xs text-on-surface-variant/60 mt-1">PNG, JPG, WebP, PDF up to 10MB</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((item) => (
          <div key={item.id} className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden group">
            <div className="aspect-square bg-surface-container-low flex items-center justify-center relative">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">
                {item.name.endsWith(".pdf") ? "description" : "image"}
              </span>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  onClick={() => copyUrl(item.id, item.url)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                  title="Copy URL"
                >
                  <span className="material-symbols-outlined text-white text-[18px]">
                    {copiedId === item.id ? "check" : "content_copy"}
                  </span>
                </button>
                <button
                  onClick={() => deleteMedia(item.id)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-red-500/50 transition"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-white text-[18px]">delete</span>
                </button>
              </div>
            </div>
            <div className="p-2.5">
              <p className="font-label text-xs text-on-surface truncate">{item.name}</p>
              <p className="font-label text-[10px] text-on-surface-variant">{item.size}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
