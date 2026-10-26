"use client";

import { useState } from "react";

const initialCategories = [
  { id: 1, name: "Edible Salt", products: 42, order: 1 },
  { id: 2, name: "Salt Lamps", products: 28, order: 2 },
  { id: 3, name: "Bath & Spa", products: 19, order: 3 },
  { id: 4, name: "Cooking Accessories", products: 15, order: 4 },
  { id: 5, name: "Home Decor", products: 23, order: 5 },
  { id: 6, name: "Industrial Salt", products: 12, order: 6 },
  { id: 7, name: "Gift Sets", products: 8, order: 7 },
  { id: 8, name: "Animal Lick Salt", products: 9, order: 8 },
];

export default function CataloguePage() {
  const [categories, setCategories] = useState(initialCategories);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...categories];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setCategories(updated.map((c, i) => ({ ...c, order: i + 1 })));
  };

  const moveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const updated = [...categories];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setCategories(updated.map((c, i) => ({ ...c, order: i + 1 })));
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl text-on-surface">Catalogue</h1>

      {/* Category Ordering */}
      <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-label text-sm font-medium text-on-surface">
            Category Order
          </h2>
          <p className="font-label text-xs text-on-surface-variant">
            Use arrows to reorder categories
          </p>
        </div>
        <div className="space-y-2">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className={`flex items-center gap-4 p-3 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition ${
                draggedId === cat.id ? "opacity-50" : ""
              }`}
              draggable
              onDragStart={() => setDraggedId(cat.id)}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedId === null) return;
                const fromIndex = categories.findIndex((c) => c.id === draggedId);
                const toIndex = index;
                const updated = [...categories];
                const [moved] = updated.splice(fromIndex, 1);
                updated.splice(toIndex, 0, moved);
                setCategories(updated.map((c, i) => ({ ...c, order: i + 1 })));
                setDraggedId(null);
              }}
            >
              <span className="material-symbols-outlined text-on-surface-variant/40 cursor-grab">
                drag_indicator
              </span>
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-label text-xs flex items-center justify-center">
                {cat.order}
              </span>
              <div className="flex-1">
                <p className="font-label text-sm font-medium text-on-surface">
                  {cat.name}
                </p>
                <p className="font-label text-xs text-on-surface-variant">
                  {cat.products} products
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveUp(index)}
                  className="p-1 rounded hover:bg-surface-container transition"
                  disabled={index === 0}
                >
                  <span className={`material-symbols-outlined text-[18px] ${index === 0 ? "text-on-surface-variant/30" : "text-on-surface-variant"}`}>
                    arrow_upward
                  </span>
                </button>
                <button
                  onClick={() => moveDown(index)}
                  className="p-1 rounded hover:bg-surface-container transition"
                  disabled={index === categories.length - 1}
                >
                  <span className={`material-symbols-outlined text-[18px] ${index === categories.length - 1 ? "text-on-surface-variant/30" : "text-on-surface-variant"}`}>
                    arrow_downward
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Generation Placeholder */}
      <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
        <h2 className="font-label text-sm font-medium text-on-surface mb-4">
          PDF Catalogue Generation
        </h2>
        <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">
            picture_as_pdf
          </span>
          <p className="font-label text-sm text-on-surface-variant">
            PDF catalogue generation settings
          </p>
          <p className="font-label text-xs text-on-surface-variant/60 mt-1">
            Configure layout, branding, and content for downloadable product catalogues
          </p>
          <button className="mt-4 mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg">
            Generate PDF Catalogue
          </button>
        </div>
      </div>
    </div>
  );
}
