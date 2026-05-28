"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import {
  Database,
  Trash2,
  Check,
  Key,
  Eye,
  EyeOff,
  Pencil,
  Maximize2,
  Columns2,
  MoreVertical,
  GripVertical,
  Loader2,
  ChevronDown,
  Type,
  ImageIcon,
  FolderOpen,
  ArrowRight,
  List,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/stores/appStore";
import { setLastSettingsCookie } from "@/lib/lastCollection";
import { useUpdateField, useReorderFields, useDeleteField } from "@/lib/query/hooks/fields";
import type { FieldResponse } from "@/lib/api/fields";
import FieldTypeDrawer, { type CreationPreset } from "@/features/fields/components/FieldTypeDrawer";

export default function CollectionSettingsPage() {
  const params = useParams();
  const collectionName = params.collection as string;
  const { setLastSettingsRoute } = useAppStore();

  const { collections, fields, initialized } = useAppStore();
  const collection = collections?.find((c) => c.meta.name === collectionName);
  const collectionId = collection?.meta.id;

  const collectionFields = useMemo(
    () => fields.filter((f) => f.meta.collectionId === collectionId),
    [fields, collectionId],
  );
  const isLoading = !initialized;
  const deleteField = useDeleteField(collectionId ?? 0);
  const updateField = useUpdateField(collectionId ?? 0);
  const reorderFields = useReorderFields(collectionId ?? 0);

  const [activeFieldAction, setActiveFieldAction] = useState<number | null>(
    null,
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [sortedFields, setSortedFields] = useState<FieldResponse[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAdvanced, setDrawerAdvanced] = useState(false);
  const [editingField, setEditingField] = useState<FieldResponse | null>(null);
  const [deletingField, setDeletingField] = useState<FieldResponse | null>(null);
  const [creationPreset, setCreationPreset] = useState<CreationPreset | null>(null);
  const [creationMenuOpen, setCreationMenuOpen] = useState(false);

  useEffect(() => {
    if (initialized) {
      setSortedFields([...collectionFields].sort((a, b) => (a.meta.sortOrder ?? 0) - (b.meta.sortOrder ?? 0)));
    }
  }, [collectionFields, initialized]);

  useEffect(() => {
    setLastSettingsRoute("/admin/settings/data-model");
    setLastSettingsCookie("/admin/settings/data-model");
  }, [setLastSettingsRoute]);

  const dragStartIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragStartIndex.current = index;
    dragOverIndex.current = index;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragStartIndex.current === null || dragOverIndex.current === index) return;
    const from = dragStartIndex.current;
    const to = index;
    if (from === to) return;
    dragOverIndex.current = index;
    setDraggedIndex(index);

    setSortedFields((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragStartIndex.current = to;
  };

  const handleDragEnd = () => {
    dragStartIndex.current = null;
    dragOverIndex.current = null;
    setDraggedIndex(null);

    reorderFields.mutate(
      sortedFields.map((f, i) => ({ id: f.meta.id, sortOrder: i }))
    );
  };

  const creationMenuItems = [
    { value: 'standard' as const, label: 'Standard Field', icon: Type },
    { value: 'single-file' as const, label: 'Single File', icon: ImageIcon },
    { value: 'multiple-file' as const, label: 'Multiple File', icon: FolderOpen },
    { value: 'm2o' as const, label: 'M2O Relationship', icon: ArrowRight },
    { value: 'o2m' as const, label: 'O2M Relationship', icon: List },
    { value: 'm2m' as const, label: 'M2M Relationship', icon: GitBranch },
  ];

  const handlePresetSelect = (preset: CreationPreset) => {
    setCreationPreset(preset);
    setDrawerAdvanced(true);
    setEditingField(null);
    setDrawerOpen(true);
  };


  return (
    <>
      <PageHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#6B7280]" />
            <div>
              <span className="block text-xs font-bold text-[#a2b5cd] leading-3">
                Data Model
              </span>
              <h1 className="text-[16px] font-semibold text-[#111827]">
                {collectionName?.charAt(0).toUpperCase() +
                  collectionName?.slice(1)}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-[#e04342]">
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="flex flex-1 flex-col bg-white">
        <div className="w-full max-w-[720px] px-6 py-6">
          <div className="mb-6">
            <div className="mb-3">
              <h2 className="text-[16px] font-semibold text-[#111827]">
                Fields & Layouts
              </h2>
              <p className="text-xs text-[#6B7280]">
                Changes are saved automatically
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#9CA3AF]" />
              </div>
            ) : sortedFields.length === 0 ? (
              <div className="flex items-center justify-center rounded-md border-2 border-dashed border-[#E5E7EB] py-12">
                <p className="text-sm text-[#9CA3AF]">
                  No fields yet. Create your first field.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-[10px]">
                {sortedFields.map((field, index) => (
                  <div
                    key={field.meta.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      setEditingField(field);
                      setDrawerAdvanced(true);
                      setDrawerOpen(true);
                    }}
                    className={`relative h-[54px] flex rounded-md border-2 border-[#f0f4f9] hover:border-[#d3dae4] drag:border-primary ${field.meta.width === "half" ? "w-[calc(50%-5px)]" : "w-full"} ${draggedIndex === index ? "border-primary! border-dashed" : ""}`}
                  >
                    <div className="w-full h-full px-3 flex items-center gap-2 cursor-pointer">
                      <span className="flex cursor-grab items-center text-[#9CA3AF] active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-medium text-[#4f5464]">
                        {field.meta.label}
                      </span>
                      <span className="text-xs text-[#9CA3AF]">
                        {field.meta.name || field.type}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-1 mr-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative">
                        <button
                      onClick={(e) => {
                        setActiveFieldAction(
                          activeFieldAction === field.meta.id ? null : field.meta.id,
                        );
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827]"
                          title="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeFieldAction === field.meta.id && (
                          <>
                            <div
                              className="fixed cursor-auto inset-0 z-10"
                              onClick={(e) => {
                                setActiveFieldAction(null);
                              }}
                            />
                            <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg">
                              <button
                                onClick={() => {
                                  setActiveFieldAction(null);
                                  setEditingField(field);
                                  setDrawerAdvanced(true);
                                  setDrawerOpen(true);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[#111827] transition-colors hover:bg-[#F9FAFB]"
                              >
                                <Pencil className="h-3.5 w-3.5 text-[#6B7280]" />
                                Edit
                              </button>
                              <div className="my-1 border-t border-[#E5E7EB]" />
                              <button
                                onClick={() => {
                                  setActiveFieldAction(null);
                                  updateField.mutate({
                                    fieldId: field.meta.id,
                                    payload: {
                                      meta: { hidden: !field.meta.hidden },
                                    },
                                  });
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[#111827] transition-colors hover:bg-[#F9FAFB]"
                              >
                                {field.meta.hidden ? (
                                  <EyeOff className="h-3.5 w-3.5 text-[#6B7280]" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5 text-[#6B7280]" />
                                )}
                                {field.meta.hidden ? "Show In Details" : "Hidden In Details"}
                              </button>
                              <div className="my-1 border-t border-[#E5E7EB]" />
                              <button
                                onClick={() => {
                                  setActiveFieldAction(null);
                                  updateField.mutate({
                                    fieldId: field.meta.id,
                                    payload: {
                                      meta: {
                                        width: field.meta.width === "full" ? "half" : "full",
                                      },
                                    },
                                  });
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[#111827] transition-colors hover:bg-[#F9FAFB]"
                              >
                                <Columns2 className="h-3.5 w-3.5 text-[#6B7280]" />
                                {field.meta.width === "full"
                                  ? "Half Width"
                                  : "Full Width"}
                              </button>
                              <div className="my-1 border-t border-[#E5E7EB]" />
                              <button
                                onClick={() => {
                                  setActiveFieldAction(null);
                                  setDeletingField(field);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {/* 
              <button
                onClick={() => {
                  setDrawerAdvanced(false);
                  setDrawerOpen(true);
                }}
                className="flex h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-white transition-colors hover:bg-[#e04342]"
              >
                + Create Field
              </button>
              */}
          <div className="relative">
            <button
              onClick={() => setCreationMenuOpen(!creationMenuOpen)}
              className="flex w-full cursor-pointer items-center justify-center gap-1 text-sm text-[#6B7280] transition-colors hover:text-[#111827]"
            >
              Create Field in Advanced Mode
              <ChevronDown className={`h-4 w-4 transition-transform ${creationMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {creationMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCreationMenuOpen(false)} />
                <div className="absolute bottom-full left-0 right-0 z-20 mb-1 rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg">
                  {creationMenuItems.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        setCreationMenuOpen(false);
                        handlePresetSelect(item.value);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[#111827] transition-colors hover:bg-[#F9FAFB]"
                    >
                      <item.icon className="h-3.5 w-3.5 text-[#6B7280]" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
            </div>
          </div>
        </div>
      </div>

      <FieldTypeDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerAdvanced(false);
          setEditingField(null);
          setCreationPreset(null);
        }}
        collectionId={collectionId ?? 0}
        collectionName={collectionName}
        defaultAdvanced={drawerAdvanced}
        editingField={editingField}
        creationPreset={creationPreset ?? undefined}
      />

      {deletingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#111827]">
              Delete Field
            </h3>
            <p className="mt-2 text-sm text-[#6B7280]">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#111827]">
                {deletingField.meta.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletingField(null)}
                className="rounded-md border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteField.mutate(deletingField.meta.id, {
                    onError: (e) => {
                      toast.error(e instanceof Error ? e.message : "Failed to delete field");
                    },
                  });
                  setDeletingField(null);
                }}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
