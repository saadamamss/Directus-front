"use client";

import type { FieldResponse } from "@/lib/api/fields";

interface Props {
  field: FieldResponse;
  value: unknown;
  onChange: (val: unknown) => void;
}

export default function BooleanField({ field, value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 max-w-[320px]">
      <input
        type="checkbox"
        id={field.field}
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
      />
      <label htmlFor={field.field} className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
    </div>
  );
}
