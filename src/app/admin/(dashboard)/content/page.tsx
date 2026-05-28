"use client";

import { useEffect, useRef } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Box, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ContentPage() {
  const router = useRouter();
  const { collections, initialized } = useAppStore();
  const isLoading = !initialized;
  const redirected = useRef(false);

  const cookieCollection = readCookie("last-collection");

  useEffect(() => {
    if (redirected.current) return;
    if (cookieCollection) {
      redirected.current = true;
      router.replace(`/admin/content/${cookieCollection}`);
    }
  }, [cookieCollection, router]);

  useEffect(() => {
    if (redirected.current) return;
    if (!isLoading && collections && collections.length > 0) {
      redirected.current = true;
      const target = cookieCollection ?? collections[0].collection;
      router.replace(`/admin/content/${target}`);
    }
  }, [isLoading, collections, cookieCollection, router]);

  if (redirected.current) return null;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#9CA3AF]" />
      </div>
    );
  }

  if (collections && collections.length > 0) return null;

  return (
    <>
      <PageHeader>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-full bg-[#E4EAF1]">
            <Box className="h-4 w-4 text-[#6B7280]" />
          </span>
          <h1 className="text-[16px] font-semibold text-[#111827]">Content</h1>
        </div>
      </PageHeader>

      <div className="flex flex-1 items-center justify-center bg-white">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F9FAFB]">
            <Box className="h-8 w-8 text-[#9CA3AF]" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[#111827]">
            No Collections
          </h2>
          <p className="mb-6 max-w-sm text-sm text-[#6B7280]">
            Get started by creating your first collection to organize your data.
          </p>
          <button
            onClick={() => router.push("/admin/settings/data-model?new")}
            className="flex h-[40px] items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-[#e04342]"
          >
            Create Collection
          </button>
        </div>
      </div>
    </>
  );
}
