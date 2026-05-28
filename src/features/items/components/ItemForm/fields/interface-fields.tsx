"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { FieldResponse } from "@/lib/api/fields";

interface FieldProps {
  field: FieldResponse;
  value: unknown;
  onChange: (val: unknown) => void;
}

export function ToggleField({ field, value, onChange }: FieldProps) {
  return (
    <div className="max-w-[320px]">
      <label
        className={`flex h-[54px] cursor-pointer items-center gap-3 rounded-md border-2 bg-white px-4 transition-colors ${
          !!value ? "border-primary bg-[#FEF2F2]" : "border-[#E5E7EB] hover:border-primary"
        }`}
      >
        <Checkbox
          checked={!!value}
          onCheckedChange={(v) => onChange(v)}
          className="h-5 w-5 rounded border-2 data-[state=checked]:bg-primary data-[state=checked]:text-white"
        />
        <div>
          <span className="text-sm font-medium text-[#111827]">
            {field.meta.label}
            {field.meta.required && <span className="ml-1 text-red-500">*</span>}
          </span>
          {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
        </div>
      </label>
    </div>
  );
}

export function DropdownField({ field, value, onChange }: FieldProps) {
  const choices = (field.meta.options?.choices as { text: string; value: string }[]) ?? [];
  const strValue = value != null ? String(value) : "";
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <Select value={strValue} onValueChange={(v) => onChange(v)}>
        <SelectTrigger className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {choices.map((choice, i) => (
            <SelectItem key={i} value={choice.value}>{choice.text}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
    </div>
  );
}

export function RadioButtonsField({ field, value, onChange }: FieldProps) {
  const choices = (field.meta.options?.choices as { text: string; value: string }[]) ?? [];
  const strValue = value != null ? String(value) : "";
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-3">
        {choices.map((choice, i) => (
          <label
            key={i}
            className={`flex cursor-pointer items-center gap-3 rounded-md border-2 px-4 py-3 transition-colors ${
              strValue === choice.value
                ? "border-primary bg-[#FEF2F2]"
                : "border-[#E5E7EB] bg-white hover:border-primary"
            }`}
          >
            <input
              type="radio"
              name={field.field}
              value={choice.value}
              checked={strValue === choice.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
              strValue === choice.value ? "border-primary" : "border-[#D1D5DB]"
            }`}>
              {strValue === choice.value && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </div>
            <span className="text-sm font-medium text-[#111827]">{choice.text}</span>
          </label>
        ))}
      </div>
      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
    </div>
  );
}

export function ColorField({ field, value, onChange }: FieldProps) {
  const colorPresets = (field.meta.options?.colors as { name: string; color: string }[]) ?? [];
  const strValue = value != null ? String(value) : "";
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="flex h-[54px] items-center gap-3 rounded-md border-2 border-[#E5E7EB] bg-white px-3">
        <input
          type="color"
          value={strValue || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-[#E5E7EB] bg-transparent p-0.5"
        />
        <span className="text-sm text-[#6B7280]">{strValue || "#000000"}</span>
      </div>
      {colorPresets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colorPresets.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(preset.color)}
              className="group relative flex items-center gap-2 rounded-md border-2 border-[#E5E7EB] px-3 py-2 transition-colors hover:border-primary"
            >
              <span className="h-5 w-5 rounded-full border border-[#E5E7EB]" style={{ backgroundColor: preset.color }} />
              <span className="text-sm text-[#6B7280] group-hover:text-[#111827]">{preset.name}</span>
            </button>
          ))}
        </div>
      )}
      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
    </div>
  );
}

export function SliderField({ field, value, onChange }: FieldProps) {
  const strValue = value != null ? String(value) : "0";
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="range"
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full accent-primary"
      />
      <span className="text-sm text-[#6B7280]">{strValue}</span>
      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
    </div>
  );
}
