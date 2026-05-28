"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import {
  Box,
  Plus,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { setLastCollectionCookie } from "@/lib/lastCollection";
import { useAppStore } from "@/stores/appStore";
import { useFields } from "@/lib/query/hooks/fields";
import { useItems, useDeleteItems } from "@/lib/query/hooks/items";
import type { Item } from "@/lib/api/items";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function CollectionContentPage() {
  const params = useParams();
  const router = useRouter();
  const collectionName = params.collection as string;

  const { setLastAccessedCollection } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (collectionName) {
      setLastCollectionCookie(collectionName);
      setLastAccessedCollection(collectionName);
    }
  }, [collectionName, setLastAccessedCollection]);

  const { collections } = useAppStore();
  const collection = collections?.find((c) => c.meta.name === collectionName);
  const collectionId = collection?.meta.id;

  const { data: fields } = useFields(collectionId);

  const { data: itemsData, isLoading, isFetching } = useItems(collectionName, {
    page,
    limit: 15,
    search: debouncedSearch || undefined,
  });

  const items: Item[] = itemsData?.items ?? [];
  const total = itemsData?.total ?? 0;
  const totalPages = itemsData?.totalPages ?? 1;

  const sortedFields = fields
    ? [...fields]
        .filter((f) => !f.meta.isSystem)
        .sort((a, b) => a.meta.sortOrder - b.meta.sortOrder)
    : [];

  const [showColumns, setShowColumns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!fields) return;
    const sorted = [...fields].sort((a, b) => a.meta.sortOrder - b.meta.sortOrder);
    setShowColumns((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const f of sorted) {
        if (!(f.field in next)) {
          next[f.field] = !f.meta.hidden;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [fields]);

  const visibleFields = sortedFields.filter((f) => showColumns[f.field]);

  const deleteItemsMutation = useDeleteItems(collectionName);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const handleDelete = async () => {
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteItemsMutation.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      setConfirmOpen(false);
    } catch {
      setConfirmOpen(false);
    }
  };

  const loading = isLoading && items.length === 0;

  const noFields = fields && fields.length === 0;

  return (
    <>
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#E4EAF1] p-2">
              <Box className="h-4 w-4 text-[#6B7280]" />
            </span>
            <div>
              <span className="block text-xs font-bold leading-3 text-[#a2b5cd]">
                Content
              </span>
              <h1 className="text-[16px] font-semibold text-[#111827]">
                {collectionName?.charAt(0).toUpperCase() +
                  collectionName?.slice(1)}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className="h-[32px] w-[200px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-primary focus:outline-none"
              />
            </div>
            {selectedIds.size > 0 && (
              <button
                onClick={handleDelete}
                disabled={deleteItemsMutation.isPending}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                aria-label="Delete selected"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <Link
              href={`/admin/content/${collectionName}/+`}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-[#e04342]"
              aria-label="Add Item"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </PageHeader>

      <div className="flex flex-1 flex-col bg-white px-4">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : noFields ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F9FAFB]">
                <Box className="h-8 w-8 text-[#9CA3AF]" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#111827]">
                No Fields Defined
              </h2>
              <p className="mb-6 max-w-sm text-sm text-[#6B7280]">
                This collection has no fields. Add fields in the settings to
                start adding items.
              </p>
            </div>
          </div>
        ) : items.length === 0 && fields ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F9FAFB]">
                <Box className="h-8 w-8 text-[#9CA3AF]" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#111827]">
                No Items
              </h2>
              <p className="mb-6 max-w-sm text-sm text-[#6B7280]">
                Add your first item to this collection.
              </p>
              <Link
                href={`/admin/content/${collectionName}/+`}
                className="flex h-[40px] items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-[#e04342]"
              >
                Add Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <table className="w-full">
              <thead className="sticky top-0 bg-white group">
                <tr className="border-b-[3px] border-[#f0f4f9]">
                  <th className="h-[45px] w-10 px-3">
                    <input
                      type="checkbox"
                      className={`h-4 w-4 rounded border-2 border-[#a2b5cd] transition-opacity ${
                        selectedIds.size === items.length && items.length > 0
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      checked={
                        selectedIds.size === items.length && items.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
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
                  <th className="h-[45px] w-10 px-3">
                    <div className="relative">
                      <button
                        onClick={() => setColumnMenuOpen(!columnMenuOpen)}
                        className="flex h-6 w-6 items-center justify-center rounded text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827]"
                        aria-label="Toggle columns"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {columnMenuOpen && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg">
                          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                            Show Columns
                          </div>
                          {sortedFields.map((f) => (
                            <button
                              key={f.field}
                              onClick={() =>
                                setShowColumns((prev) => ({
                                  ...prev,
                                  [f.field]: !prev[f.field],
                                }))
                              }
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827]"
                            >
                              {showColumns[f.field] ? (
                                <Eye className="h-3.5 w-3.5" />
                              ) : (
                                <EyeOff className="h-3.5 w-3.5" />
                              )}
                              <span>{f.meta.label || f.field}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() =>
                      router.push(
                        `/admin/content/${collectionName}/${item.id}`,
                      )
                    }
                    className={`group cursor-pointer border-b-[3px] border-[#f0f4f9] hover:bg-[#F9FAFB] ${
                      selectedIds.has(item.id)
                        ? "bg-[#F9FAFB]"
                        : ""
                    }`}
                  >
                    <td
                      className="h-[45px] px-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className={`h-4 w-4 rounded border-2 border-[#a2b5cd] transition-opacity ${
                          selectedIds.has(item.id)
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
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
                    <td className="h-[45px] px-3" />
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#f0f4f9] px-3 py-3">
                <span className="text-sm text-[#6B7280]">
                  {total} item{total !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded text-[#6B7280] transition-colors hover:bg-[#F9FAFB] disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-[#6B7280]">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded text-[#6B7280] transition-colors hover:bg-[#F9FAFB] disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {isFetching && !isLoading && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
        title="Delete items"
        message={`Are you sure you want to delete ${selectedIds.size} item(s)? This action cannot be undone.`}
        isLoading={deleteItemsMutation.isPending}
      />
    </>
  );
}
