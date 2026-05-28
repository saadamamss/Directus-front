"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ChevronRight, List, Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useItems } from "@/lib/query/hooks/items";
import { useFields } from "@/lib/query/hooks/fields";
import { useAppStore } from "@/stores/appStore";
import type { Item } from "@/lib/api/items";
import type { FieldResponse } from "@/lib/api/fields";

interface RelatedItemsDrawerProps {
  open: boolean;
  collectionName: string;
  onSelect: (item: Item) => void;
  onClose: () => void;
}

export function RelatedItemsDrawer({
  open,
  collectionName,
  onSelect,
  onClose,
}: RelatedItemsDrawerProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [page] = useState(1);
  const { data: itemsData, isLoading } = useItems(collectionName, { page, limit: 100 });
  const items: Item[] = itemsData?.items ?? [];
  const { collections } = useAppStore();
  const collection = collections?.find((c) => c.meta.name === collectionName);
  const collectionId = collection?.meta.id;
  const { data: fields } = useFields(collectionId);

  const sortedFields = fields
    ? [...fields].filter((f) => !f.meta.isSystem).sort((a, b) => a.meta.sortOrder - b.meta.sortOrder)
    : [];

  const visibleFields = sortedFields.filter((f) => f.meta.hidden !== true);

  useEffect(() => {
    if (!open) {
      setSelectedItem(null);
    }
  }, [open]);

  const handleSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onClose();
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="inset-x-auto right-0 top-0 mt-0 h-full w-full min-w-[770px] max-w-[770px] rounded-none border-l bg-white [&>button]:hidden">
        <DrawerTitle className="sr-only">Select item</DrawerTitle>
        <div className="absolute left-[-44px] top-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6B7280] shadow-md transition-colors hover:bg-[#F1F5F9]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex h-full flex-col">
          <div className="flex h-[54px] shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4">
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Select {collectionName}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelect}
                disabled={!selectedItem}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  selectedItem
                    ? "bg-primary text-white hover:bg-[#e04342]"
                    : "bg-[#E5E7EB] text-[#9CA3AF]"
                }`}
                title="Confirm selection"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2E8F0]">
                  <List className="h-6 w-6 text-[#64748B]" />
                </div>
                <p className="text-sm text-[#6B7280]">No items in this collection.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-[3px] border-[#f0f4f9]">
                    {visibleFields.map((f, i) => (
                      <th
                        key={f.field}
                        className="relative h-[45px] px-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]"
                      >
                        {f.meta.label || f.field}
                        {i < visibleFields.length - 1 && (
                          <span className="absolute right-0 top-1/2 h-[20px] w-[3px] -translate-y-1/2 bg-[#f0f4f9]" />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                      }}
                      onDoubleClick={() => {
                        setSelectedItem(item);
                        onSelect(item);
                        onClose();
                      }}
                      className={`cursor-pointer border-b-[3px] border-[#f0f4f9] transition-colors hover:bg-[#F9FAFB] ${
                        selectedItem?.id === item.id ? "bg-[#E4EAF1]" : ""
                      }`}
                    >
                      {visibleFields.map((f) => (
                        <td
                          key={f.field}
                          className="h-[45px] max-w-[200px] px-3"
                        >
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#4f5464]">
                            {String(item[f.field] ?? "")}
                          </div>
                        </td>
                      ))}
                      <td className="h-[45px] px-3">
                        <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}