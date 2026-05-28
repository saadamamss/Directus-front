"use client";

import { useState, useEffect, useRef } from "react";
import { X, Box } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useCreateField, useUpdateField } from "@/lib/query/hooks/fields";
import { fetchFieldTypes, type FieldType as BackendFieldType } from "@/lib/api/help";
import type { FieldResponse, FieldMeta, CreateFieldPayload, UpdateFieldPayload } from "@/lib/api/fields";
import SimpleMode from "./SimpleMode";
import AdvancedFormWrapper from "./AdvancedFormWrapper";
import { useAppStore } from "@/stores/appStore";

export type CreationPreset = 'standard' | 'single-file' | 'multiple-file' | 'm2o' | 'o2m' | 'm2m';

interface FieldTypeDrawerProps {
  open: boolean;
  onClose: () => void;
  collectionId: number;
  collectionName?: string;
  defaultAdvanced?: boolean;
  editingField?: FieldResponse | null;
  creationPreset?: CreationPreset;
}

export default function FieldTypeDrawer({
  open,
  onClose,
  collectionId,
  collectionName,
  defaultAdvanced,
  editingField,
  creationPreset,
}: FieldTypeDrawerProps) {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fieldTypes, setFieldTypes] = useState<BackendFieldType[]>([]);
  const prevOpen = useRef(false);
  const createField = useCreateField(collectionId);
  const updateField = useUpdateField(collectionId);
  const { collections: allCollections } = useAppStore();

  useEffect(() => {
    fetchFieldTypes()
      .then(setFieldTypes)
      .catch(() => setFieldTypes([]));
  }, []);

  useEffect(() => {
    if (open && !prevOpen.current) setShowAdvanced(defaultAdvanced ?? false);
    prevOpen.current = open;
  }, [open, defaultAdvanced]);

  const handleSave = (data: CreateFieldPayload | Partial<FieldResponse>, fieldId?: number) => {
    if (fieldId) {
      updateField.mutate(
        { fieldId, payload: data as UpdateFieldPayload },
        {
          onSuccess: () => {
            toast.success("Field updated");
            handleClose();
          },
          onError: (e) => {
            toast.error(e instanceof Error ? e.message : "Failed to update field");
          },
        },
      );
    } else {
      createField.mutate(
        data as CreateFieldPayload,
        {
          onSuccess: () => {
            toast.success("Field created");
            handleClose();
          },
          onError: (e) => {
            toast.error(e instanceof Error ? e.message : "Failed to create field");
          },
        },
      );
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedField(null);
    setShowAdvanced(false);
  };

  const handleSimpleSave = (data: Record<string, unknown>) => {
    createField.mutate(data as unknown as CreateFieldPayload, {
      onSuccess: () => {
        toast.success("Field created");
        handleClose();
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Failed to create field");
      },
    });
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => { if (!v) handleClose(); }}
      direction="right"
    >
      <DrawerContent className="inset-x-auto right-0 top-0 mt-0 h-full w-full max-w-[770px] rounded-none border-l bg-white [&>button]:hidden">
        <DrawerTitle className="sr-only">New Field</DrawerTitle>

        <div className="absolute left-0 top-[12px] -translate-x-[calc(100%+12px)] z-10 max-sm:hidden">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827]"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex h-full flex-col">
          {!showAdvanced && (
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827] sm:hidden"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
              <Box className="h-5 w-5 text-[#475569]" />
              <h2 className="text-[20px] font-bold leading-tight text-[#1E293B]">
                {editingField ? `Edit: ${editingField.field}` : "New Field"}
                {collectionName && <span className="font-normal text-[#64748B]"> ({collectionName})</span>}
              </h2>
            </div>
          )}

          {showAdvanced ? (
            <AdvancedFormWrapper
              key={editingField?.field ?? "new"}
              editingField={editingField ?? null}
              fieldTypes={fieldTypes}
              collectionName={collectionName}
              allCollections={allCollections || []}
              creationPreset={creationPreset}
              onSave={(data, fieldId) => handleSave(data as CreateFieldPayload | Partial<FieldResponse>, fieldId)}
            />
          ) : (
            <SimpleMode
              selectedField={selectedField}
              onSelectField={setSelectedField}
              collectionName={collectionName}
              onAdvanced={() => setShowAdvanced(true)}
              onSave={handleSimpleSave}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
