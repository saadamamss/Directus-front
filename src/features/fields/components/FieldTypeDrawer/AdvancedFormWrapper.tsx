"use client";

import { useAdvancedFieldForm } from "@/features/fields/hooks/useAdvancedFieldForm";
import type { FieldResponse, CreateFieldPayload, UpdateFieldPayload } from "@/lib/api/fields";
import type { FieldType as BackendFieldType } from "@/lib/api/help";
import type { CollectionResponse } from "@/types/api";
import type { CreationPreset } from "./index";
import AdvancedMode from "./AdvancedMode";

export default function AdvancedFormWrapper({
  editingField,
  fieldTypes,
  collectionName,
  allCollections,
  creationPreset,
  onSave,
}: {
  editingField: FieldResponse | null;
  fieldTypes: BackendFieldType[];
  allCollections: CollectionResponse[];
  collectionName?: string;
  creationPreset?: CreationPreset;
  onSave: (data: CreateFieldPayload | UpdateFieldPayload, fieldId?: number) => void;
}) {
  const advancedForm = useAdvancedFieldForm(editingField, fieldTypes, collectionName, creationPreset);

  const handleAdvancedSave = () => {
    const payload = advancedForm.buildPayload();
    onSave(payload as unknown as CreateFieldPayload | UpdateFieldPayload, (editingField as unknown as { meta?: { id?: number } } | null)?.meta?.id as number);
  };

  return (
    <div className="flex h-full flex-col">
      <AdvancedMode
        {...advancedForm}
        collectionName={collectionName}
        editingField={editingField}
        onSave={handleAdvancedSave}
        allCollections={allCollections}
      />
    </div>
  );
}
