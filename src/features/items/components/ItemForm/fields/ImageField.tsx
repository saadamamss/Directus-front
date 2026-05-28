"use client";

import { ImagePlus, Upload, FolderOpen, Download, Trash2 } from "lucide-react";
import type { FieldResponse } from "@/lib/api/fields";
import type { FileInfo } from "@/lib/api/upload";
import { formatFileSize } from "@/shared/utils/format";

interface Props {
  field: FieldResponse;
  value: unknown;
  onChange: (val: unknown) => void;
  fileInfos: Record<string, FileInfo>;
  onUploadClick: () => void;
  onLibraryClick: () => void;
}

export default function ImageField({ field, value, onChange, fileInfos, onUploadClick, onLibraryClick }: Props) {
  const fileId = typeof value === "string" && value ? value : "";
  const info = fileId ? fileInfos[fileId] : null;

  return (
    <div className="space-y-2 col-span-2">
      <label className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="group relative flex h-[280px] items-center justify-center overflow-hidden rounded-lg">
        {info ? (
          <>
            <img src={info.url} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-start justify-end gap-1 bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" onClick={() => window.open(info.url, "_blank")}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-[#475569] transition-colors hover:bg-white" title="Download">
                <Download className="h-4 w-4" />
              </button>
              <button type="button" onClick={onUploadClick}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-[#475569] transition-colors hover:bg-white" title="Replace">
                <Upload className="h-4 w-4" />
              </button>
              <button type="button" onClick={onLibraryClick}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-[#475569] transition-colors hover:bg-white" title="From Library">
                <FolderOpen className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onChange(null)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-red-500 transition-colors hover:bg-white" title="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="truncate text-xs text-white">{info.filename_download}</span>
              <span className="shrink-0 text-xs text-white/70">
                {info.width && info.height ? `${info.width}×${info.height} — ` : ""}
                {formatFileSize(info.filesize)} — {info.type}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center gap-4 border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E2E8F0]">
              <ImagePlus className="h-8 w-8 text-[#64748B]" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onUploadClick}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e04342]">
                <FolderOpen className="h-4 w-4" /> Browse
              </button>
              <button type="button" onClick={onLibraryClick}
                className="flex items-center gap-2 rounded-md border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F1F5F9]">
                <FolderOpen className="h-4 w-4" /> Choose from Library
              </button>
            </div>
          </div>
        )}
      </div>
      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
    </div>
  );
}
