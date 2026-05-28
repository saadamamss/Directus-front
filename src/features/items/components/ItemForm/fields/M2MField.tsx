"use client";

import { FolderOpen, Plus, X } from "lucide-react";
import { useState } from "react";
import { useItems } from "@/lib/query/hooks/items";
import { useAppStore } from "@/stores/appStore";
import { RelatedItemsDrawer } from "@/components/ui/RelatedItemsDrawer";
import { CreateRelatedItemDrawer } from "@/components/ui/CreateRelatedItemDrawer";
import type { FieldResponse } from "@/lib/api/fields";
import type { Item } from "@/lib/api/items";

interface Props {
  field: FieldResponse;
  value: unknown;
  onChange: (val: unknown) => void;
  collectionName?: string;
}

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

export default function M2MField({ field, value, onChange, collectionName }: Props) {
  const opts = field.meta.options as Record<string, unknown> | null;
  const relations = useAppStore((s) => s.relations);
  const collections = useAppStore((s) => s.collections);
  const currentCollection = field.collection;
  const tableName = collections.find((c) => c.meta.name === currentCollection)?.meta.tableName;

  // Find the relation where this field is the "one" side of the junction
  const junctionRel = relations.find(
    (r) =>
      r.meta.oneCollection === tableName &&
      r.meta.oneField === field.field
  );

  // Find the OTHER relation in the same junction table (not this field's relation)
  // This gives us the related collection we want to display
  const otherJunctionRel = junctionRel
    ? relations.find(
        (r) =>
          r.meta.manyCollection === junctionRel.meta.manyCollection &&
          r.field !== junctionRel.field
      )
    : null;

  const childCollection = otherJunctionRel?.relatedCollection || "";
  const displayTemplate = (opts?.displayTemplate as string) || "id";
  const enableCreate = opts?.enableCreate !== false;
  const enableSelect = opts?.enableSelect !== false;
  const childIds = Array.isArray(value) ? (value as number[]) : [];

  const { data: childItemsData } = useItems(childCollection, { limit: 100 });
  const childItems = childItemsData?.items ?? [];

  const [selectDrawerOpen, setSelectDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

  const handleSelect = (item: Item) => {
    const newIds = [...childIds, item.id];
    onChange(newIds);
    setSelectDrawerOpen(false);
  };

  const handleCreateSuccess = (itemId: number) => {
    const newIds = [...childIds, itemId];
    onChange(newIds);
    setCreateDrawerOpen(false);
  };

  const handleRemove = (id: number) => {
    const newIds = childIds.filter((i) => i !== id);
    onChange(newIds);
  };

  return (
    <div className="space-y-2 col-span-2">
      <label className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="rounded-lg border-2 border-[#E5E7EB] bg-white">
        {childIds.length === 0 ? (
          <p className="px-4 py-3 text-sm text-[#9CA3AF]">No related items</p>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {childIds.map((id) => {
              const item = childItems.find((ci) => ci.id === id);
              const display = item
                ? renderTemplate(displayTemplate, item as Record<string, unknown>)
                : String(id);
              return (
                <div
                  key={id}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-sm text-[#111827]">{display}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9CA3AF]">{String(id).slice(0, 8)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(id)}
                      className="flex h-6 w-6 items-center justify-center rounded text-[#9CA3AF] hover:text-red-500 hover:bg-[#F1F5F9]"
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {(enableCreate || enableSelect) && (
          <div className="flex gap-2 border-t border-[#E5E7EB] px-4 py-2">
            {enableCreate && (
              <button
                type="button"
                onClick={() => setCreateDrawerOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-[#e04342]"
              >
                <Plus className="h-3.5 w-3.5" /> Create
              </button>
            )}
            {enableSelect && (
              <button
                type="button"
                onClick={() => setSelectDrawerOpen(true)}
                className="flex items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:bg-[#F1F5F9]"
              >
                <FolderOpen className="h-3.5 w-3.5" /> Select
              </button>
            )}
          </div>
        )}
      </div>

      <RelatedItemsDrawer
        open={selectDrawerOpen}
        collectionName={childCollection}
        onSelect={handleSelect}
        onClose={() => setSelectDrawerOpen(false)}
      />

      <CreateRelatedItemDrawer
        open={createDrawerOpen}
        collectionName={childCollection}
        onItemCreated={handleCreateSuccess}
        onClose={() => setCreateDrawerOpen(false)}
      />

      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}

      {childCollection && (
        <>
          <RelatedItemsDrawer
            open={selectDrawerOpen}
            collectionName={childCollection}
            onSelect={handleSelect}
            onClose={() => setSelectDrawerOpen(false)}
          />

          <CreateRelatedItemDrawer
            open={createDrawerOpen}
            collectionName={childCollection}
            onItemCreated={handleCreateSuccess}
            onClose={() => setCreateDrawerOpen(false)}
          />
        </>
      )}
    </div>
  );
}