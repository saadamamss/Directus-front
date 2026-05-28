"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, Settings, User, LogOut, FolderOpen } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useLogout } from "@/lib/query/hooks/auth";
import Logo from "@/components/Logo";

export function IconSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lastAccessedCollection, lastSettingsRoute, collections } = useAppStore();
  const logoutMutation = useLogout();

  const isActive = (href: string) => pathname.startsWith(href);

  const handleContentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (collections.length === 0) {
      router.push("/admin/content");
      return;
    }
    const target =
      lastAccessedCollection && collections.some((c) => c.meta.name === lastAccessedCollection)
        ? lastAccessedCollection
        : collections[0].meta.name;
    router.push(`/admin/content/${target}`);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = lastSettingsRoute || "/admin/settings/data-model";
    router.push(target);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen w-[54px] flex-shrink-0 flex-col items-center bg-[#0F172A]">
      <div className="flex h-[54px] w-[54px] items-center justify-center bg-primary p-2">
        <Logo />
      </div>

      <div className="flex flex-1 flex-col items-center">
        <button
          onClick={handleContentClick}
          className={`flex h-[54px] w-[54px] items-center justify-center transition-colors ${
            isActive("/admin/content")
              ? "bg-[#f0f4f9] text-black"
              : "text-[#64748B] hover:bg-[#f0f4f9] hover:text-black"
          }`}
          title="Content"
        >
          <Box className="h-5 w-5" />
        </button>

        <button
          onClick={() => router.push("/admin/files")}
          className={`flex h-[54px] w-[54px] items-center justify-center transition-colors ${
            isActive("/admin/files")
              ? "bg-[#f0f4f9] text-black"
              : "text-[#64748B] hover:bg-[#f0f4f9] hover:text-black"
          }`}
          title="Files"
        >
          <FolderOpen className="h-5 w-5" />
        </button>

        <button
          onClick={handleSettingsClick}
          className={`flex h-[54px] w-[54px] items-center justify-center transition-colors ${
            isActive("/admin/settings")
              ? "bg-[#f0f4f9] text-black"
              : "text-[#64748B] hover:bg-[#f0f4f9] hover:text-black"
          }`}
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={() => router.push("/admin/profile")}
          className={`flex h-[54px] w-[54px] items-center justify-center transition-colors ${
            isActive("/admin/profile")
              ? "bg-[#f0f4f9] text-black"
              : "text-[#64748B] hover:bg-[#f0f4f9] hover:text-black"
          }`}
          title="Profile"
        >
          <User className="h-5 w-5" />
        </button>
        <button
          onClick={handleLogout}
          className="flex h-[54px] w-[54px] items-center justify-center text-[#64748B] transition-colors hover:bg-[#f0f4f9] hover:text-black"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
