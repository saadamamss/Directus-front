"use client";

import FieldTypeCard from "@/components/fields/FieldTypeCard";
import FieldForm from "@/components/fields/FieldForm";
import { textAndNumberFields, selectionFields, simpleTypeToValue, simpleTypeToInterface } from "./constants";

export default function SimpleMode({
  selectedField,
  onSelectField,
  collectionName,
  onAdvanced,
  onSave,
}: {
  selectedField: string | null;
  onSelectField: (f: string | null) => void;
  collectionName?: string;
  onAdvanced: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const handleSave = (fieldType: string, data: Record<string, unknown>) => {
    const type = simpleTypeToValue[fieldType] || "STRING";
    const iface = simpleTypeToInterface[fieldType];
    onSave({
      field: data.field as string,
      type,
      meta: {
        ...data.meta as Record<string, unknown>,
        interface: iface,
        width: "full",
      },
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-6">
      <div className="mt-6">
        <div className="mb-4 border-b border-[#E2E8F0] pb-2">
          <h3 className="text-sm font-semibold text-[#64748B]">Text & Numbers</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 min-[480px]:grid-cols-3 min-[640px]:grid-cols-4">
          {textAndNumberFields.map((field) => (
            <FieldTypeCard
              key={field}
              label={field}
              selected={selectedField === field}
              onClick={() => onSelectField(selectedField === field ? null : field)}
            />
          ))}
        </div>
        {selectedField && textAndNumberFields.includes(selectedField) && (
          <div className="mt-4">
            <FieldForm
              type={selectedField}
              collectionName={collectionName}
              onAdvanced={onAdvanced}
              onSave={(data) => handleSave(selectedField, data)}
            />
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-4 border-b border-[#E2E8F0] pb-2">
          <h3 className="text-sm font-semibold text-[#64748B]">Selection</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 min-[480px]:grid-cols-3 min-[640px]:grid-cols-4">
          {selectionFields.map((field) => (
            <FieldTypeCard
              key={field}
              label={field}
              selected={selectedField === field}
              onClick={() => onSelectField(selectedField === field ? null : field)}
            />
          ))}
        </div>
        {selectedField && selectionFields.includes(selectedField) && (
          <div className="mt-4">
            <FieldForm
              type={selectedField}
              collectionName={collectionName}
              onAdvanced={onAdvanced}
              onSave={(data) => handleSave(selectedField, data)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
