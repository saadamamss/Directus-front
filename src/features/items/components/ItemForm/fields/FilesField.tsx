"use client";

import { Upload, FolderOpen, X, FileIcon } from "lucide-react";
import type { FieldResponse } from "@/lib/api/fields";
import type { FileInfo } from "@/lib/api/upload";
import { formatFileSize } from "@/shared/utils/format";

interface Props {
  field: FieldResponse;
  files: FileInfo[];
  onUploadClick: () => void;
  onLibraryClick: () => void;
  onRemove: (fileId: string) => void;
}

export default function FilesField({ field, files, onUploadClick, onLibraryClick, onRemove }: Props) {
  return (
    <div className="space-y-2 col-span-2">
      <label className="text-sm font-medium text-[#111827]">
        {field.meta.label}
        {field.meta.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="rounded-lg border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4">
        {files.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 rounded-md border border-[#E5E7EB] bg-white px-3 py-2">
                {file.type?.startsWith("image/") ? (
                  <img src={file.url} alt="" className="h-10 w-10 rounded object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-[#F1F5F9]">
                    <FileIcon className="h-5 w-5 text-[#64748B]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[#111827]">{file.filename_download}</p>
                  <p className="text-xs text-[#9CA3AF]">{formatFileSize(file.filesize)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  className="flex h-7 w-7 items-center justify-center rounded text-[#9CA3AF] hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onUploadClick}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e04342]">
            <Upload className="h-4 w-4" /> Upload
          </button>
          <button type="button" onClick={onLibraryClick}
            className="flex items-center gap-2 rounded-md border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F1F5F9]">
            <FolderOpen className="h-4 w-4" /> From Library
          </button>
        </div>
      </div>
      {field.meta.note && <p className="text-xs text-[#9CA3AF]">{field.meta.note}</p>}
    </div>
  );
}
