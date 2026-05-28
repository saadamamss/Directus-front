"use client";

import { Plus, PanelLeftClose, ChevronRight, Database, Settings, Code, FolderOpen, Folder, File, User, KeyRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getMenuSection } from "@/components/layout/menuConfig";
import { useAppStore } from "@/stores/appStore";
import { useFolderTree } from "@/lib/query/hooks/folders";
import { useState, Suspense } from "react";

const settingsItems = [
  { icon: Database, label: "Data Model", href: "/admin/settings/data-model" },
];

interface MenuSidebarProps {
  onClose: () => void;
}

export default function MenuSidebar({ onClose }: MenuSidebarProps) {
  const pathname = usePathname();
  const section = getMenuSection(pathname);
  const { collections } = useAppStore();
  const collectionLinks = (collections ?? []).map((c) => ({
    name: c.meta.name,
    href: `/admin/content/${c.meta.name}`,
  }));

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="flex h-screen w-[198px] flex-shrink-0 flex-col bg-[#f0f4f9]">
      {/* Title bar - 54px height */}
      <div className="flex h-[54px] items-center justify-between bg-[#E4EAF1] px-4">
        <h2 className="text-[14px] font-semibold text-[#111827]">DataForge</h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#E5E7EB] hover:text-[#111827]"
          aria-label="Close sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Menu content area */}
      <div className="flex flex-1 flex-col p-[10px]">
        {/* Content section - empty state */}
        {section === "content" && collectionLinks.length === 0 && (
          <Link
            href="/admin/settings/data-model?new"
            className="flex h-[40px] w-full items-center justify-center gap-2 rounded-md bg-primary/0 px-4 text-sm font-medium text-primary border border-2 border-dashed hover:bg-primary/10 transition-colors"
          >
            Create Collection
          </Link>
        )}

        {/* Content section - collection list */}
        {section === "content" && collectionLinks.length > 0 && (
          <div className="flex flex-col gap-1">
            {collectionLinks.map(({ name, href }) => (
              <Link
                key={name}
                href={href}
                className={`flex h-[32px] w-full items-center gap-2 rounded-md px-3 text-[13px] transition-colors ${
                  isActive(href)
                    ? "bg-[#E4EAF1] text-black"
                    : "text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
                }`}
              >
                <span className="truncate font-semibold">{name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Profile section */}
        {section === "profile" && (
          <div className="flex flex-col gap-1">
            <Link
              href="/admin/profile"
              className={`flex h-[32px] w-full items-center gap-2 rounded-md px-3 text-[13px] transition-colors ${
                pathname === "/admin/profile"
                  ? "bg-[#E4EAF1] text-black"
                  : "text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
              }`}
            >
              <User className="h-[18px] w-[18px] flex-shrink-0 text-primary" />
              <span className="truncate font-semibold">Account Information</span>
            </Link>
            <Link
              href="/admin/profile/password"
              className={`flex h-[32px] w-full items-center gap-2 rounded-md px-3 text-[13px] transition-colors ${
                isActive("/admin/profile/password")
                  ? "bg-[#E4EAF1] text-black"
                  : "text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
              }`}
            >
              <KeyRound className="h-[18px] w-[18px] flex-shrink-0 text-primary" />
              <span className="truncate font-semibold">Change Password</span>
            </Link>
          </div>
        )}

        {/* Settings section - menu items */}
        {section === "settings" && (
          <div className="flex flex-col gap-1">
            {settingsItems.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className={`flex h-[32px] w-full items-center gap-2 rounded-md px-3 text-[13px] transition-colors ${
                  isActive(href)
                    ? "bg-[#E4EAF1] text-black"
                    : "text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
                }`}
              >
                {Icon && (
                  <Icon className="h-[18px] w-[18px] flex-shrink-0 text-primary" />
                )}
                <span className="truncate font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Files section - folder tree */}
        {section === "files" && (
          <Suspense fallback={<div className="px-3 text-xs text-[#9CA3AF]">Loading...</div>}>
            <FolderTreeSidebar />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function FolderTreeSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folder");
  const { data: tree } = useFolderTree();

  return (
    <div className="flex flex-col gap-1">
      <Link
        href="/admin/files"
        className={`flex h-[32px] w-full items-center gap-2 rounded-md px-3 text-[13px] transition-colors ${
          !currentFolderId
            ? "bg-[#E4EAF1] text-black"
            : "text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
        }`}
      >
        <FolderOpen className="h-[18px] w-[18px] flex-shrink-0 text-[#64748B]" />
        <span className="truncate font-semibold">All Files</span>
      </Link>

      {tree && tree.length > 0 && (
        <>
          <div className="my-1 border-t border-[#E5E7EB]" />
          {tree.map((folder) => (
            <FolderTreeItem
              key={folder.id}
              folder={folder}
              depth={0}
              currentFolderId={currentFolderId}
            />
          ))}
        </>
      )}
    </div>
  );
}

function FolderTreeItem({
  folder,
  depth,
  currentFolderId,
}: {
  folder: import("@/lib/api/folders").FolderMeta;
  depth: number;
  currentFolderId: string | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div
        className={`flex h-[32px] w-full items-center gap-0 rounded-md px-0 text-[13px] transition-colors ${
          currentFolderId === folder.id
            ? "bg-[#E4EAF1] text-black"
            : "text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="flex h-full w-5 shrink-0 items-center justify-center"
        >
          {hasChildren ? (
            <ChevronRight
              className={`h-3 w-3 text-[#9CA3AF] transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            />
          ) : null}
        </button>

        <Link
          href={`/admin/files?folder=${folder.id}`}
          className="flex h-full flex-1 items-center gap-1.5"
        >
          <Folder className="h-4 w-4 shrink-0 text-[#64748B]" />
          <span className="truncate font-semibold">{folder.name}</span>
        </Link>
      </div>
      {expanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              currentFolderId={currentFolderId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
