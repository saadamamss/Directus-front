"use client";

import { MenuProvider, useMenu } from "@/components/layout/MenuContext";
import { IconSidebar } from "@/components/layout/IconSidebar";
import MenuSidebar from "@/components/layout/MenuSidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useLastCollectionInit } from "@/hooks/useLastCollectionInit";
import { useAppPreloader } from "@/hooks/useAppPreloader";
import { useAppStore } from "@/stores/appStore";
import { Loader2 } from "lucide-react";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  useLastCollectionInit();
  useAppPreloader();
  const { menuOpen, setMenuOpen } = useMenu();
  const initialized = useAppStore((s) => s.initialized);

  if (!initialized) {
    return (
      <AuthGuard>
        <div className="flex h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#9CA3AF]" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-white">
        <IconSidebar />
        {menuOpen && <MenuSidebar onClose={() => setMenuOpen(false)} />}
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MenuProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </MenuProvider>
  );
}
