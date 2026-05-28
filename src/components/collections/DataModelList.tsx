"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setLastSettingsCookie } from "@/lib/lastCollection";
import PageHeader from "@/components/layout/PageHeader";
import CreateCollectionForm from "@/components/collections/CreateCollectionForm";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import {
  Database,
  Box,
  ExternalLink,
  Trash2,
  MoreVertical,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useDeleteCollection } from "@/lib/query/hooks/collections";
import type { CollectionResponse } from "@/types/api";

export default function DataModelList() {
  const router = useRouter();
  const { collections, initialized } = useAppStore();
  const isLoading = !initialized;
  const deleteCollection = useDeleteCollection();
  const { setLastAccessedCollection, setLastSettingsRoute } = useAppStore();
  const searchParams = useSearchParams();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<CollectionResponse | null>(null);
  const [search, setSearch] = useState("");
  const drawerOpen = searchParams.has("new");

  const hideDrawer = () => {
    router.push("/admin/settings/data-model");
  };

  useEffect(() => {
    setLastSettingsRoute("/admin/settings/data-model");
    setLastSettingsCookie("/admin/settings/data-model");
  }, [setLastSettingsRoute]);

  const list = collections ?? [];
  const filtered = list.filter((c) =>
    c.meta.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#6B7280]" />
            <div>
              <span className="block text-xs font-bold text-[#a2b5cd] leading-3">
                Settings
              </span>
              <h1 className="text-[16px] font-semibold text-[#111827]">
                Data Model
              </h1>
            </div>
          </div>
          {list.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-[32px] w-[200px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-primary focus:outline-none"
                />
              </div>
              <button
                onClick={() => router.push("/admin/settings/data-model?new")}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-[#e04342]"
                aria-label="Create Collection"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </PageHeader>

      <div className="flex flex-1 flex-col bg-white">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#9CA3AF]" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F9FAFB]">
                <Box className="h-8 w-8 text-[#9CA3AF]" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#111827]">
                No Collections
              </h2>
              <p className="mb-6 max-w-sm text-sm text-[#6B7280]">
                Create your first collection to define your data structure.
              </p>
              <button
                onClick={() => router.push("/admin/settings/data-model?new")}
                className="flex h-[40px] items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-[#e04342]"
              >
                Create Collection
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            {filtered.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-[#9CA3AF]">No collections found</p>
              </div>
            ) : (
              filtered.map((collection) => (
                <Link
                  key={collection.meta.id}
                  href={`/admin/settings/data-model/${collection.meta.name}`}
                  className="flex items-center justify-between rounded-md border-2 border-[#E5E7EB] hover:border-[#babfc9] px-4 py-2 mx-6 mt-2"
                >
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-[#111827]">
                      {collection.meta.name}
                    </span>
                  </div>

                  <div className="relative" onClick={(e) => e.preventDefault()}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeletingCollection(collection);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-primary transition-colors hover:bg-[#E5E7EB] cursor-pointer"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={(v) => {
          if (!v) hideDrawer();
        }}
        direction="right"
        shouldScaleBackground={false}
      >
        <DrawerContent className="inset-x-auto right-0 top-0 mt-0 h-full w-full max-w-[770px] rounded-none border-l bg-white [&>button]:hidden">
          <DrawerTitle className="sr-only">Create Collection</DrawerTitle>
          <CreateCollectionForm onClose={hideDrawer} onSuccess={hideDrawer} />
        </DrawerContent>
      </Drawer>

      {deletingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#111827]">
              Delete Collection
            </h3>
            <p className="mt-2 text-sm text-[#6B7280]">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#111827]">
                {deletingCollection.meta.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletingCollection(null)}
                className="rounded-md border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCollection.mutate(deletingCollection.meta.id, {
                    onError: (e) => {
                      toast.error(e instanceof Error ? e.message : "Failed to delete collection");
                    },
                  });
                  setDeletingCollection(null);
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
