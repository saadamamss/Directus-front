"use client";

import { Input } from "@/components/ui/input";
import type { FieldResponse } from "@/lib/api/fields";

interface Props {
  field: FieldResponse;
  value: unknown;
  onChange: (val: unknown) => void;
}

export default function StringField({ field, value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <Input
        value={value != null ? String(value) : ""}
        placeholder={(field.meta.options?.placeholder as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        maxLength={field.schema.maxLength ?? undefined}
      />
      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
    </div>
  );
}
