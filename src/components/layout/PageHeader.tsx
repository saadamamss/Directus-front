"use client";

import MenuSidebarToggle from "@/components/layout/MenuSidebarToggle";
import { useMenu } from "@/components/layout/MenuContext";

interface PageHeaderProps {
  children: React.ReactNode;
}

export default function PageHeader({ children }: PageHeaderProps) {
  const { menuOpen, setMenuOpen } = useMenu();

  return (
    <header className="flex h-[54px] w-full items-center px-6">
      {!menuOpen && <MenuSidebarToggle onOpen={() => setMenuOpen(true)} />}
      <div className="flex-1 ">{children}</div>
    </header>
  );
}
