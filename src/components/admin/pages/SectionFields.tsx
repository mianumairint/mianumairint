"use client";

import TiptapEditor from "@/components/admin/TiptapEditor";
import CoverImageUploader from "@/components/admin/CoverImageUploader";
import type { FieldSchema } from "@/types/page";

/**
 * Renders an editable form for one section's `data`, driven by the field
 * descriptors in SECTION_SCHEMAS. Reuses the existing Tiptap editor and the
 * existing image uploader (which posts to /api/admin/media/upload).
 */

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary";

type Data = Record<string, any>;

interface Props {
  fields: FieldSchema[];
  data: Data;
  onChange: (data: Data) => void;
}

export default function SectionFields({ fields, data, onChange }: Props) {
  const set = (key: string, value: unknown) => onChange({ ...data, [key]: value });

  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <Field key={field.key} field={field} value={data[field.key]} onChange={(v) => set(field.key, v)} />
      ))}
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: any;
  onChange: (v: any) => void;
}) {
  const label = (
    <label className="font-label text-xs text-on-surface-variant block mb-1.5">
      {field.label}
      {field.help && (
        <span className="text-on-surface-variant/60 normal-case"> — {field.help}</span>
      )}
    </label>
  );

  switch (field.kind) {
    case "textarea":
      return (
        <div>
          {label}
          <textarea
            rows={4}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>
      );

    case "richtext":
      return (
        <div>
          {label}
          <TiptapEditor content={value ?? ""} onChange={onChange} />
        </div>
      );

    case "image":
      return (
        <div>
          {label}
          <CoverImageUploader imageUrl={value ?? ""} onChange={onChange} />
        </div>
      );

    case "list":
      return <ListField label={label} value={value} onChange={onChange} />;

    case "repeater":
      return (
        <RepeaterField
          label={label}
          fields={field.fields ?? []}
          value={value}
          onChange={onChange}
        />
      );

    default:
      return (
        <div>
          {label}
          <input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        </div>
      );
  }
}

/* ── List of plain strings ── */
function ListField({
  label,
  value,
  onChange,
}: {
  label: React.ReactNode;
  value: any;
  onChange: (v: string[]) => void;
}) {
  const items: string[] = Array.isArray(value) ? value : [];

  const update = (i: number, v: string) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const target = i + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  return (
    <div>
      {label}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={item} onChange={(e) => update(i, e.target.value)} className={inputClass} />
            <IconBtn icon="arrow_upward" title="Move up" onClick={() => move(i, -1)} />
            <IconBtn icon="arrow_downward" title="Move down" onClick={() => move(i, 1)} />
            <IconBtn icon="close" title="Remove" onClick={() => remove(i)} danger />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="font-label text-xs text-primary hover:underline mt-2"
      >
        + Add item
      </button>
    </div>
  );
}

/* ── List of objects ── */
function RepeaterField({
  label,
  fields,
  value,
  onChange,
}: {
  label: React.ReactNode;
  fields: FieldSchema[];
  value: any;
  onChange: (v: Data[]) => void;
}) {
  const rows: Data[] = Array.isArray(value) ? value : [];

  const updateRow = (i: number, row: Data) =>
    onChange(rows.map((r, idx) => (idx === i ? row : r)));
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const target = i + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  const blank = () => Object.fromEntries(fields.map((f) => [f.key, ""]));

  return (
    <div>
      {label}
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="border border-outline-variant/30 rounded-lg p-4 bg-surface-container-low/40">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label text-xs text-on-surface-variant/70">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <IconBtn icon="arrow_upward" title="Move up" onClick={() => move(i, -1)} />
                <IconBtn icon="arrow_downward" title="Move down" onClick={() => move(i, 1)} />
                <IconBtn icon="delete" title="Remove" onClick={() => remove(i)} danger />
              </div>
            </div>
            <div className="space-y-3">
              {fields.map((f) => (
                <Field
                  key={f.key}
                  field={f}
                  value={row[f.key]}
                  onChange={(v) => updateRow(i, { ...row, [f.key]: v })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...rows, blank()])}
        className="font-label text-xs text-primary hover:underline mt-2"
      >
        + Add entry
      </button>
    </div>
  );
}

function IconBtn({
  icon,
  title,
  onClick,
  danger,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg hover:bg-surface-container transition-colors shrink-0 ${
        danger ? "text-red-600" : "text-on-surface-variant"
      }`}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
    </button>
  );
}
