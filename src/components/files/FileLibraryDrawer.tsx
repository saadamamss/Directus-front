"use client";

import { useState, useEffect } from "react";
import {
  X,
  Check,
  FolderOpen,
  Folder,
  File,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { fetchFiles, fetchFileInfo, type FileInfo } from "@/lib/api/upload";
import {
  fetchFolderTree,
  type FolderMeta,
} from "@/lib/api/folders";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileLibraryDrawerProps {
  open: boolean;
  selectedId?: string | null;
  onSelect: (fileId: string) => void;
  onClose: () => void;
}

export default function FileLibraryDrawer({
  open,
  selectedId,
  onSelect,
  onClose,
}: FileLibraryDrawerProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [tree, setTree] = useState<FolderMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [fileInfos, setFileInfos] = useState<Record<string, FileInfo>>({});

  useEffect(() => {
    if (!open) return;
    setSelectedFileId(selectedId ?? null);
    setCurrentFolderId(null);
    setLoading(true);
    Promise.all([
      fetchFiles(null),
      fetchFolderTree(),
    ])
      .then(([filesData, treeData]) => {
        setFiles(filesData);
        setTree(treeData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, selectedId]);

  useEffect(() => {
    if (currentFolderId === undefined) return;
    setLoading(true);
    setSelectedFileId(null);
    fetchFiles(currentFolderId)
      .then(setFiles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentFolderId]);

  const handleSelect = () => {
    if (selectedFileId) onSelect(selectedFileId);
  };

  return (
    <Drawer open={open} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="inset-x-auto right-0 top-0 mt-0 h-full w-full min-w-[770px] max-w-[770px] rounded-none border-l bg-white overflow-visible [&>button]:hidden">
        <DrawerTitle className="sr-only">Select file</DrawerTitle>
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
          {/* Header */}
          <div className="flex h-[54px] shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4">
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Select file
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelect}
                disabled={!selectedFileId}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  selectedFileId
                    ? "bg-primary text-white hover:bg-[#e04342]"
                    : "bg-[#E5E7EB] text-[#9CA3AF]"
                }`}
                title="Confirm selection"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Folder tree sidebar */}
            <div className="w-[210px] shrink-0 overflow-y-auto border-r border-[#E5E7EB] p-[10px]">
              <button
                type="button"
                onClick={() => setCurrentFolderId(null)}
                className={`flex h-[32px] w-full items-center gap-2 rounded-md px-3 text-[13px] transition-colors ${
                  currentFolderId === null
                    ? "bg-[#E4EAF1] text-black"
                    : "text-[#6B7280] hover:bg-[#E5E7EB]"
                }`}
              >
                <FolderOpen className="h-[18px] w-[18px] shrink-0 text-[#64748B]" />
                <span className="truncate font-semibold">All Files</span>
              </button>
              {tree.length > 0 && (
                <>
                  <div className="my-1 border-t border-[#E5E7EB]" />
                  {tree.map((folder) => (
                    <FolderTreeItem
                      key={folder.id}
                      folder={folder}
                      depth={0}
                      currentFolderId={currentFolderId}
                      onSelect={(id) => setCurrentFolderId(id)}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Files grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : files.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2E8F0]">
                    <FolderOpen className="h-6 w-6 text-[#64748B]" />
                  </div>
                  <p className="text-sm text-[#6B7280]">
                    No files in this folder.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {files.map((file) => {
                    const info = fileInfos[file.id] || file;
                    return (
                      <div
                        key={file.id}
                        className={`group relative h-[120px] w-[120px] cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                          selectedFileId === file.id
                            ? "border-primary"
                            : "border-[#E5E7EB] hover:border-[#CBD5E1]"
                        }`}
                        onClick={() =>
                          setSelectedFileId(
                            selectedFileId === file.id ? null : file.id,
                          )
                        }
                      >
                        <div className="flex h-full w-full items-center justify-center bg-[#F8FAFC]">
                          {file.type?.startsWith("image/") ? (
                            <img
                              src={file.url}
                              alt={file.filename_download}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <File className="h-8 w-8 text-[#64748B]" />
                          )}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4">
                          <p className="truncate text-[10px] font-medium text-white">
                            {file.filename_download}
                          </p>
                          <p className="text-[9px] text-white/80">
                            {formatFileSize(file.filesize)}
                          </p>
                        </div>
                        <div
                          className={`absolute -left-10 -top-10 h-20 w-20 bg-[radial-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0)_70%)]`}
                        >
                          <div
                            className={`absolute left-11 top-11 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                              selectedFileId === file.id
                                ? "border-primary bg-white"
                                : "border-white"
                            }`}
                          >
                            {selectedFileId === file.id && (
                              <span className="text-[14px] font-bold text-primary leading-1">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function FolderTreeItem({
  folder,
  depth,
  currentFolderId,
  onSelect,
}: {
  folder: FolderMeta;
  depth: number;
  currentFolderId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div
        className={`flex h-[32px] w-full items-center gap-0 rounded-md px-0 text-[13px] transition-colors ${
          currentFolderId === folder.id
            ? "bg-[#E4EAF1] text-black"
            : "text-[#6B7280] hover:bg-[#E5E7EB]"
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
        <button
          type="button"
          onClick={() => onSelect(folder.id)}
          className="flex h-full flex-1 items-center gap-1.5"
        >
          <Folder className="h-4 w-4 shrink-0 text-[#64748B]" />
          <span className="truncate font-semibold">{folder.name}</span>
        </button>
      </div>
      {expanded && hasChildren &&
        folder.children.map((child) => (
          <FolderTreeItem
            key={child.id}
            folder={child}
            depth={depth + 1}
            currentFolderId={currentFolderId}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}
