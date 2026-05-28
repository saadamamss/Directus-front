"use client";

import type { FieldResponse } from "@/lib/api/fields";
import type { FileInfo } from "@/lib/api/upload";
import StringField from "./fields/StringField";
import TextField from "./fields/TextField";
import NumberField from "./fields/NumberField";
import BooleanField from "./fields/BooleanField";
import DateField from "./fields/DateField";
import ImageField from "./fields/ImageField";
import M2OField from "./fields/M2OField";
import O2MField from "./fields/O2MField";
import M2MField from "./fields/M2MField";
import { ToggleField, DropdownField, RadioButtonsField, ColorField, SliderField } from "./fields/interface-fields";

export interface FieldRendererProps {
  field: FieldResponse;
  value: unknown;
  onChange: (val: unknown) => void;
  collectionName: string;
  fileInfos: Record<string, FileInfo>;
  filesFieldData: Record<string, FileInfo[]>;
  onUploadClick: (fieldName: string) => void;
  onLibraryClick: (fieldName: string) => void;
  onFileRemove: (fieldName: string, fileId: string) => void;
}

export default function ItemFormField({
  field,
  value,
  onChange,
  collectionName,
  fileInfos,
  filesFieldData,
  onUploadClick,
  onLibraryClick,
  onFileRemove,
}: FieldRendererProps) {
  const strValue = value != null ? String(value) : "";

  if (field.meta.readonly) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#111827]">{field.meta.label}</label>
        <div className="rounded-md border border-[#E5E7EB] bg-gray-50 px-3 py-2 text-sm text-[#6B7280]">
          {strValue || "—"}
        </div>
        {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
      </div>
    );
  }

  const iface = field.meta.interface;

  if (iface) {
    switch (iface) {
      case "textarea":
      case "wysiwyg":
        return <TextField field={field} value={value} onChange={onChange} />;
      case "toggle":
        return <ToggleField field={field} value={value} onChange={onChange} />;
      case "dropdown":
        return <DropdownField field={field} value={value} onChange={onChange} />;
      case "radio-buttons":
        return <RadioButtonsField field={field} value={value} onChange={onChange} />;
      case "color":
        return <ColorField field={field} value={value} onChange={onChange} />;
      case "image":
        return (
          <ImageField
            field={field}
            value={value}
            onChange={onChange}
            fileInfos={fileInfos}
            onUploadClick={() => onUploadClick(field.field)}
            onLibraryClick={() => onLibraryClick(field.field)}
          />
        );
      case "slider":
        return <SliderField field={field} value={value} onChange={onChange} />;
      case "o2m":
      case "list-o2m":
      case "table-o2m":
        return <O2MField field={field} value={value} onChange={onChange} collectionName={collectionName} />;
      case "m2o":
      case "select-dropdown-m2o":
        return <M2OField field={field} value={value} onChange={onChange} />;
      case "m2m":
      case "list-m2m":
      case "table-m2m":
        return <M2MField field={field} value={value} onChange={onChange} collectionName={collectionName} />;
    }
  }

  const type = field.type?.toUpperCase();

  switch (type) {
    case "TEXT":
      return <TextField field={field} value={value} onChange={onChange} />;
    case "BOOLEAN":
      return <BooleanField field={field} value={value} onChange={onChange} />;
    case "INTEGER":
    case "BIGINT":
    case "FLOAT":
    case "DECIMAL":
      return <NumberField field={field} value={value} onChange={onChange} />;
    case "DATE":
      return <DateField field={field} value={value} onChange={onChange} />;
    default:
      return <StringField field={field} value={value} onChange={onChange} />;
  }
}
