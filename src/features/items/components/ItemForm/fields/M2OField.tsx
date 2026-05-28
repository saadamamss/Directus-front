"use client";

import { FolderOpen, Plus, X } from "lucide-react";
import { useState } from "react";
import { useItem } from "@/lib/query/hooks/items";
import { useAppStore } from "@/stores/appStore";
import { RelatedItemsDrawer } from "@/components/ui/RelatedItemsDrawer";
import { CreateRelatedItemDrawer } from "@/components/ui/CreateRelatedItemDrawer";
import type { FieldResponse } from "@/lib/api/fields";
import type { Item } from "@/lib/api/items";

function renderTemplate(template: string, item: Record<string, unknown>): string {
  return template.replace(/\{\{(.+?)\}\}/g, (_, key: string) => {
    const parts = key.trim().split(".");
    let value: unknown = item;
    for (const part of parts) {
      if (value && typeof value === "object") {
        value = (value as Record<string, unknown>)[part];
      } else {
        return `{{${key}}}`;
      }
    }
    return value != null ? String(value) : `{{${key}}}`;
  });
}

interface Props {
  field: FieldResponse;
  value: unknown;
  onChange: (val: unknown) => void;
}

export default function M2OField({ field, value, onChange }: Props) {
  const opts = field.meta.options as Record<string, unknown> | null;
  const relations = useAppStore((s) => s.relations);
  const relatedCollection = relations.find(
    (r) => r.collection === field.collection && r.field === field.field
  )?.relatedCollection || "";
  const displayTemplate = (opts?.displayTemplate as string) || "";
  const enableCreate = opts?.enableCreate !== false;
  const enableSelect = opts?.enableSelect !== false;
  const hasValue = value != null && value !== "";
  const parentId = hasValue && typeof value === "number" ? value : 0;
  const { data: parentItem } = useItem(relatedCollection, parentId || 0);
  const [selectDrawerOpen, setSelectDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

  const displayText = parentItem && displayTemplate
    ? renderTemplate(displayTemplate, parentItem as Record<string, unknown>)
    : null;

  const handleSelect = (item: Item) => {
    onChange(item.id);
  };

  const handleCreateSuccess = (itemId: number) => {
    onChange(itemId);
  };

  return (
    <div className="space-y-2 col-span-2">
      <label className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="relative rounded-md border-2 border-[#E5E7EB] bg-white">
        <div className="px-3 py-2 pr-20 text-sm text-[#111827] min-h-[38px] flex items-center">
          {hasValue && parentItem ? (
            <span>{displayText ?? String(parentItem.name ?? "")}</span>
          ) : (
            <span className="text-[#9CA3AF]">—</span>
          )}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {hasValue && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="h-7 w-7 flex items-center justify-center text-[#9CA3AF] hover:text-red-500 hover:bg-[#F1F5F9] rounded"
              title="Remove">
              <X className="h-4 w-4" />
            </button>
          )}
          {enableSelect && (
            <button type="button"
              onClick={() => setSelectDrawerOpen(true)}
              className="h-7 w-7 flex items-center justify-center text-[#475569] hover:bg-[#F1F5F9] rounded"
              title="Select">
              <FolderOpen className="h-4 w-4" />
            </button>
          )}
          {enableCreate && (
            <button type="button"
              onClick={() => setCreateDrawerOpen(true)}
              className="h-7 w-7 flex items-center justify-center text-primary hover:bg-[#F1F5F9] rounded"
              title="Create">
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}

      <RelatedItemsDrawer
        open={selectDrawerOpen}
        collectionName={relatedCollection}
        onSelect={handleSelect}
        onClose={() => setSelectDrawerOpen(false)}
      />

      <CreateRelatedItemDrawer
        open={createDrawerOpen}
        collectionName={relatedCollection}
        onItemCreated={handleCreateSuccess}
        onClose={() => setCreateDrawerOpen(false)}
      />
    </div>
  );
}