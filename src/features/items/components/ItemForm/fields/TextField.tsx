"use client";

import type { FieldResponse } from "@/lib/api/fields";

interface Props {
  field: FieldResponse;
  value: unknown;
  onChange: (val: unknown) => void;
}

export default function TextField({ field, value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <textarea
        value={value != null ? String(value) : ""}
        placeholder={(field.meta.options?.placeholder as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        maxLength={field.schema.maxLength ?? undefined}
        className="w-full rounded-md border border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-primary focus:outline-none"
      />
      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
    </div>
  );
}
