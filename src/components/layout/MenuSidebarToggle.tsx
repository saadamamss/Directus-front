"use client";

import { PanelLeftOpen } from "lucide-react";

export default function MenuSidebarToggle({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-[#F9FAFB] text-[#6B7280] transition-colors hover:bg-[#E5E7EB] hover:text-[#111827]"
      aria-label="Open menu"
    >
      <PanelLeftOpen className="h-4 w-4" />
    </button>
  );
}
