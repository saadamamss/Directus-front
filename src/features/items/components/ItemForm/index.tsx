"use client";

import { ArrowLeft, Check, Loader2, Trash2, Upload, FolderOpen, X, FileIcon } from "lucide-react";
import { formatFileSize } from "@/shared/utils/format";
import PageHeader from "@/components/layout/PageHeader";
import FileLibraryDrawer from "@/components/files/FileLibraryDrawer";
import ItemFormField from "./ItemFormField";
import FilesField from "./fields/FilesField";
import { useItemForm } from "./useItemForm";

export default function ItemForm() {
  const {
    isCreate,
    collectionName,
    saving,
    loading,
    title,
    values,
    fileInfos,
    filesFieldData,
    fileInputRef,
    libraryPickerField,
    sortedFields,
    handleUploadClick,
    handleFileChange,
    handleLibrarySelect,
    handleSave,
    handleDelete,
    setValues,
    setLibraryPickerField,
    setFileInfos,
    setFilesFieldData,
    fields,
  } = useItemForm();

  const handleFieldChange = (fieldName: string, val: unknown) => {
    setValues((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleFilesRemove = (fieldName: string, fileId: string) => {
    setFilesFieldData((prev) => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).filter((f) => f.id !== fileId),
    }));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E4EAF1] text-[#6B7280] transition-colors hover:bg-[#D1D5DB]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-[16px] font-semibold text-[#111827]">{title}</h1>
            {!isCreate && (
              <span className="text-xs text-[#9CA3AF]">
                in {collectionName?.charAt(0).toUpperCase() + collectionName?.slice(1)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="item-form"
              disabled={saving}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-[#e04342] disabled:opacity-50"
              aria-label="Save item"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            {!isCreate && (
              <button
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                aria-label="Delete item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <form id="item-form" onSubmit={handleSave} className="mr-auto max-w-2xl">
          {sortedFields.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">No fields defined for this collection.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {sortedFields.map((field) => {
                const val = values[field.field];
                const colSpan = field.meta.width?.toLowerCase() === "half" ? "col-span-1" : "col-span-2";

                if (field.meta.interface === "files") {
                  return (
                    <div key={field.field} className="col-span-2 space-y-2">
                      <FilesField
                        field={field}
                        files={filesFieldData[field.field] || []}
                        onUploadClick={() => handleUploadClick(field.field)}
                        onLibraryClick={() => setLibraryPickerField(field.field)}
                        onRemove={(fileId) => handleFilesRemove(field.field, fileId)}
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.field} className={colSpan}>
                    <ItemFormField
                      field={field}
                      value={val}
                      onChange={(v) => handleFieldChange(field.field, v)}
                      collectionName={collectionName}
                      fileInfos={fileInfos}
                      filesFieldData={filesFieldData}
                      onUploadClick={handleUploadClick}
                      onLibraryClick={(fn) => setLibraryPickerField(fn)}
                      onFileRemove={(fn, fileId) => handleFilesRemove(fn, fileId)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </form>
      </div>

      <FileLibraryDrawer
        open={!!libraryPickerField}
        selectedId={libraryPickerField ? (values[libraryPickerField] as string) : null}
        onSelect={(fileId) => handleLibrarySelect(libraryPickerField!, fileId)}
        onClose={() => setLibraryPickerField(null)}
      />
    </>
  );
}
