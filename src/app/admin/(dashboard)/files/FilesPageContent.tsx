"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FolderOpen,
  Upload,
  Plus,
  Download,
  File,
  Loader2,
  Move,
  X,
  Folder,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import {
  fetchFiles,
  uploadImage,
  moveFiles,
  deleteFiles,
  type FileInfo,
} from "@/lib/api/upload";
import { useCreateFolder } from "@/lib/query/hooks/folders";
import {
  fetchFolders,
  fetchFolderAncestors,
  fetchFolderTree,
  deleteFolders,
  type FolderMeta,
} from "@/lib/api/folders";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folder");
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [subfolders, setSubfolders] = useState<FolderMeta[]>([]);
  const [ancestors, setAncestors] = useState<FolderMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(
    new Set(),
  );
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const queryClient = useQueryClient();
  const createFolder = useCreateFolder();

  useEffect(() => {
    setLoading(true);
    setSelectedFileIds(new Set());
    setSelectedFolderIds(new Set());
    Promise.all([
      fetchFiles(currentFolderId ? currentFolderId : null),
      fetchFolders(currentFolderId),
      currentFolderId
        ? fetchFolderAncestors(currentFolderId)
        : Promise.resolve([]),
    ])
      .then(([filesData, foldersData, ancestorsData]) => {
        setFiles(filesData);
        setSubfolders(foldersData);
        setAncestors(ancestorsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentFolderId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadImage(file);
      toast.success("File uploaded");
      const updated = await fetchFiles(currentFolderId ? currentFolderId : null);
      setFiles(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upload file");
    }
    e.target.value = "";
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder.mutateAsync({
        name: newFolderName.trim(),
        parentId: currentFolderId ?? undefined,
      });
      toast.success(`Folder "${newFolderName.trim()}" created`);
      setNewFolderName("");
      setShowNewFolder(false);
      const updated = await fetchFolders(currentFolderId);
      setSubfolders(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create folder");
    }
  };

  const toggleFileSelect = (id: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFolderSelect = (id: string) => {
    setSelectedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalSelected = selectedFileIds.size + selectedFolderIds.size;

  const handleMove = async () => {
    if (selectedFileIds.size === 0) return;
    try {
      await moveFiles(Array.from(selectedFileIds), moveTargetId);
      toast.success("Files moved");
      setSelectedFileIds(new Set());
      setShowMoveDialog(false);
      setMoveTargetId(null);
      const updated = await fetchFiles(currentFolderId ? currentFolderId : null);
      setFiles(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to move files");
    }
  };

  const handleDelete = async () => {
    const total = selectedFileIds.size + selectedFolderIds.size;
    if (total === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      if (selectedFileIds.size > 0)
        await deleteFiles(Array.from(selectedFileIds));
      if (selectedFolderIds.size > 0)
        await deleteFolders(Array.from(selectedFolderIds));
      toast.success("Item(s) deleted");
      setSelectedFileIds(new Set());
      setSelectedFolderIds(new Set());
      const [filesData, foldersData] = await Promise.all([
      fetchFiles(currentFolderId),
        fetchFolders(currentFolderId),
      ]);
      setFiles(filesData);
      setSubfolders(foldersData);
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete items");
    }
  };

  return (
    <>
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-[#64748B]" />
            <h1 className="text-[16px] font-semibold text-[#111827]">
              Files Library
            </h1>
            {ancestors.length > 0 && (
              <nav className="ml-2 flex items-center gap-1 text-sm text-[#6B7280]">
                {ancestors.map((a, i) => (
                  <span key={a.id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-[#9CA3AF]">/</span>}
                    <span>{a.name}</span>
                  </span>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalSelected > 0 && (
              <>
                {selectedFileIds.size > 0 && selectedFolderIds.size === 0 && (
                  <button
                    type="button"
                    onClick={() => setShowMoveDialog(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-[#e04342]"
                    title="Move selected"
                  >
                    <Move className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-red-500 transition-colors hover:bg-red-50"
                  title="Delete selected"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFileIds(new Set());
                    setSelectedFolderIds(new Set());
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:bg-[#F1F5F9]"
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowNewFolder(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#475569] transition-colors hover:bg-[#F1F5F9]"
              title="New Folder"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-[#e04342]"
              title="Upload"
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>
        </div>
      </PageHeader>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      <div className="flex-1 overflow-auto p-6">

        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {subfolders.map((folder) => (
              <div
                key={folder.id}
                className="group relative aspect-square overflow-hidden rounded-lg border-2 border-[#E5E7EB] bg-[#F8FAFC] transition-colors hover:border-primary"
              >
                <a
                  href={`/admin/files?folder=${folder.id}`}
                  className="flex h-full flex-col items-center justify-center gap-2"
                >
                  <FolderOpen className="h-10 w-10 text-[#64748B]" />
                  <span className="max-w-[80%] truncate text-xs font-medium text-[#475569]">
                    {folder.name}
                  </span>
                </a>
                <div
                  className={`absolute -left-12 -top-12 w-24 h-24 p-13 z-10 bg-[radial-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0)_70%)] transition-opacity group-hover:opacity-100 ${selectedFolderIds.has(folder.id) ? "opacity-100" : "opacity-0"}`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFolderSelect(folder.id);
                    }}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-3 cursor-pointer transition-colors ${selectedFolderIds.has(folder.id) ? "border-primary bg-white shadow-md" : "border-white"}`}
                  >
                    <span className="text-[16px] font-bold text-primary leading-1">
                      {selectedFolderIds.has(folder.id) ? "✓" : ""}
                    </span>
                  </button>
                </div>
              </div>
            ))}

            {files.map((file) => (
              <div
                key={file.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-[#E5E7EB] bg-white"
              >
                <div className="flex h-full items-center justify-center bg-[#F8FAFC]">
                  {file.type?.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt={file.filename_download}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <File className="h-10 w-10 text-[#64748B]" />
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="truncate text-xs font-medium text-white">
                    {file.filename_download}
                  </p>
                  <p className="text-[10px] text-white/80">
                    {file.width && file.height
                      ? `${file.width}×${file.height} — `
                      : ""}
                    {formatFileSize(file.filesize)}
                  </p>
                </div>
                <div
                  className={`absolute -left-12 -top-12 w-24 h-24 p-13 z-10 bg-[radial-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0)_70%)] transition-opacity group-hover:opacity-100 ${selectedFileIds.has(file.id) ? "opacity-100" : "opacity-0"}`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFileSelect(file.id);
                    }}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-3 cursor-pointer transition-colors ${selectedFileIds.has(file.id) ? "border-primary bg-white shadow-md" : "border-white"}`}
                  >
                    <span className="text-[16px] font-bold text-primary leading-1">
                      {selectedFileIds.has(file.id) ? "✓" : ""}
                    </span>
                  </button>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded border border-white/80 bg-white/80 text-[#475569] opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100"
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </a>
              </div>
            ))}

            {!loading && files.length === 0 && subfolders.length === 0 && (
              <div className="col-span-full flex flex-col items-center gap-4 py-20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E2E8F0]">
                  <FolderOpen className="h-8 w-8 text-[#64748B]" />
                </div>
                <p className="text-sm text-[#6B7280]">
                  No files yet. Upload your first file.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showMoveDialog && (
        <MoveFilesDialog
          currentFolderId={currentFolderId}
          onSelect={(folderId) => setMoveTargetId(folderId)}
          selectedFolderId={moveTargetId}
          onConfirm={handleMove}
          onClose={() => {
            setShowMoveDialog(false);
            setMoveTargetId(null);
          }}
        />
      )}

      {showNewFolder && (
        <NewFolderDialog
          value={newFolderName}
          onChange={setNewFolderName}
          onConfirm={handleCreateFolder}
          onClose={() => {
            setShowNewFolder(false);
            setNewFolderName("");
          }}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete items"
          message={`Delete ${selectedFileIds.size + selectedFolderIds.size} item${selectedFileIds.size + selectedFolderIds.size > 1 ? "s" : ""}?`}
          onConfirm={confirmDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[360px] rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F1F5F9]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-[#6B7280]">{message}</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#F1F5F9]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function NewFolderDialog({
  value,
  onChange,
  onConfirm,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[360px] rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#111827]">New Folder</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F1F5F9]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-4">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Folder name..."
            className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-primary"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirm();
              if (e.key === "Escape") onClose();
            }}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#F1F5F9]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#e04342]"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function MoveFilesDialog({
  currentFolderId,
  onSelect,
  selectedFolderId,
  onConfirm,
  onClose,
}: {
  currentFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  selectedFolderId: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [tree, setTree] = useState<FolderMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolderTree()
      .then(setTree)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[360px] rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#111827]">
            Move to folder
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F1F5F9]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => onSelect(null)}
                className={`flex h-[32px] w-full items-center gap-2 rounded-md px-3 text-[13px] transition-colors ${
                  selectedFolderId === null
                    ? "bg-[#E4EAF1] text-black"
                    : "text-[#6B7280] hover:bg-[#E5E7EB]"
                }`}
              >
                <FolderOpen className="h-4 w-4 text-[#64748B]" />
                <span className="font-semibold">Root</span>
              </button>
              {tree.map((folder) => (
                <MoveFolderItem
                  key={folder.id}
                  folder={folder}
                  depth={0}
                  selectedFolderId={selectedFolderId}
                  currentFolderId={currentFolderId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#F1F5F9]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#e04342]"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}

function MoveFolderItem({
  folder,
  depth,
  selectedFolderId,
  currentFolderId,
  onSelect,
}: {
  folder: FolderMeta;
  depth: number;
  selectedFolderId: string | null;
  currentFolderId: string | null;
  onSelect: (folderId: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;
  const disabled = folder.id === currentFolderId;

  return (
    <div>
      <div
        className={`flex h-[32px] w-full items-center gap-0 rounded-md px-0 text-[13px] transition-colors ${
          selectedFolderId === folder.id
            ? "bg-[#E4EAF1] text-black"
            : "text-[#6B7280] hover:bg-[#E5E7EB]"
        } ${disabled ? "opacity-40" : ""}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex h-full w-5 shrink-0 items-center justify-center"
        >
          {hasChildren ? (
            <svg
              className={`h-3 w-3 text-[#9CA3AF] transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => !disabled && onSelect(folder.id)}
          className="flex h-full flex-1 items-center gap-1.5"
          disabled={disabled}
        >
          <Folder className="h-4 w-4 shrink-0 text-[#64748B]" />
          <span className="truncate font-semibold">{folder.name}</span>
        </button>
      </div>
      {expanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <MoveFolderItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              currentFolderId={currentFolderId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
