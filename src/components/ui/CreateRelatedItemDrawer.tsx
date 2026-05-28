"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useAppStore } from "@/stores/appStore";
import { useFields } from "@/lib/query/hooks/fields";
import { useCreateItem } from "@/lib/query/hooks/items";
import { uploadFile, fetchFileInfo } from "@/lib/api/upload";
import type { FieldResponse } from "@/lib/api/fields";
import type { Item } from "@/lib/api/items";
import type { FileInfo } from "@/lib/api/upload";
import ItemFormField from "@/features/items/components/ItemForm/ItemFormField";
import FilesField from "@/features/items/components/ItemForm/fields/FilesField";
import FileLibraryDrawer from "@/components/files/FileLibraryDrawer";
import { NUMBER_TYPES } from "@/shared/constants/fieldTypes";

interface CreateRelatedItemDrawerProps {
  open: boolean;
  collectionName: string;
  onItemCreated: (itemId: number) => void;
  onClose: () => void;
}

export function CreateRelatedItemDrawer({
  open,
  collectionName,
  onItemCreated,
  onClose,
}: CreateRelatedItemDrawerProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [fileInfos, setFileInfos] = useState<Record<string, FileInfo>>({});
  const [filesFieldData, setFilesFieldData] = useState<
    Record<string, FileInfo[]>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [libraryPickerField, setLibraryPickerField] = useState<string | null>(
    null,
  );
  const { collections } = useAppStore();
  const collection = collections?.find((c) => c.meta.name === collectionName);
  const collectionId = collection?.meta.id;
  const { data: fields, isLoading: fieldsLoading } = useFields(collectionId);
  const createItemMutation = useCreateItem(collectionName);

  useEffect(() => {
    if (!open) {
      setValues({});
      setFileInfos({});
      setFilesFieldData({});
      setUploadingField(null);
      setLibraryPickerField(null);
    } else if (fields) {
      const initial: Record<string, unknown> = {};
      for (const field of fields) {
        const raw = field.schema?.defaultValue;
        if (raw != null) {
          initial[field.field] =
            field.type === "BOOLEAN"
              ? raw === "true"
              : NUMBER_TYPES.has(field.type)
                ? Number(raw)
                : raw;
        }
      }
      setValues(initial);
    }
  }, [open, fields]);

  const sortedFields = fields
    ? [...fields]
        .filter((f) => !f.meta.isSystem)
        .sort((a, b) => a.meta.sortOrder - b.meta.sortOrder)
    : [];

  const imageFields =
    sortedFields?.filter((f) => f.meta.interface === "image") ?? [];
  const filesFields =
    sortedFields?.filter((f) => f.meta.interface === "files") ?? [];

  useEffect(() => {
    for (const field of imageFields) {
      const id = values[field.field];
      if (typeof id === "string" && id && !fileInfos[id]) {
        fetchFileInfo(id)
          .then((info) => setFileInfos((prev) => ({ ...prev, [id]: info })))
          .catch(() => {});
      }
    }
  }, [values, imageFields, fileInfos]);

  useEffect(() => {
    for (const field of filesFields) {
      const val = values[field.field];
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
        const ids = val as string[];
        const needFetch = ids.filter((id) => !fileInfos[id]);
        if (needFetch.length > 0) {
          Promise.all(
            needFetch.map((id) => fetchFileInfo(id).catch(() => null)),
          ).then((results) => {
            const valid = results.filter((r): r is FileInfo => r != null);
            if (valid.length > 0) {
              const infoMap: Record<string, FileInfo> = {};
              for (const info of valid) infoMap[info.id] = info;
              setFileInfos((prev) => ({ ...prev, ...infoMap }));
              setFilesFieldData((prev) => ({ ...prev, [field.field]: valid }));
            }
          });
        }
      }
    }
  }, [values, filesFields, fileInfos]);

  const handleUploadClick = (fieldName: string) => {
    const field = sortedFields?.find((f) => f.field === fieldName);
    const input = fileInputRef.current;
    if (!input) return;
    setUploadingField(fieldName);
    if (field?.meta.interface === "files") {
      input.multiple = true;
      input.accept = "*/*";
    } else {
      input.multiple = false;
      input.accept = "image/*";
    }
    input.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !uploadingField) return;

    const field = sortedFields?.find((f) => f.field === uploadingField);
    const isMulti = field?.meta.interface === "files";

    const uploads = Array.from(files).map(async (file) => {
      try {
        return await uploadFile(file);
      } catch {
        return null;
      }
    });

    const results = (await Promise.all(uploads)).filter(
      (r): r is FileInfo => r != null,
    );

    if (isMulti) {
      setFilesFieldData((prev) => ({
        ...prev,
        [uploadingField]: [...(prev[uploadingField] || []), ...results],
      }));
    } else if (results.length > 0) {
      setValues((prev) => ({ ...prev, [uploadingField]: results[0].id }));
      setFileInfos((prev) => ({ ...prev, [results[0].id]: results[0] }));
    }

    e.target.value = "";
    setUploadingField(null);
  };

  const handleLibrarySelect = async (fieldName: string, fileId: string) => {
    const field = sortedFields?.find((f) => f.field === fieldName);
    if (field?.meta.interface === "files") {
      if (!fileInfos[fileId]) {
        try {
          const info = await fetchFileInfo(fileId);
          setFileInfos((prev) => ({ ...prev, [fileId]: info }));
          setFilesFieldData((prev) => ({
            ...prev,
            [fieldName]: [...(prev[fieldName] || []), info],
          }));
        } catch {
          /* failed */
        }
      } else {
        setFilesFieldData((prev) => ({
          ...prev,
          [fieldName]: [...(prev[fieldName] || []), fileInfos[fileId]],
        }));
      }
    } else {
      setValues((prev) => ({ ...prev, [fieldName]: fileId }));
      if (!fileInfos[fileId]) {
        try {
          const info = await fetchFileInfo(fileId);
          setFileInfos((prev) => ({ ...prev, [fileId]: info }));
        } catch {
          /* failed */
        }
      }
    }
    setLibraryPickerField(null);
  };

  const handleFileRemove = (fieldName: string, fileId: string) => {
    setFilesFieldData((prev) => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).filter((f) => f.id !== fileId),
    }));
  };

  const handleCreate = async () => {
    if (!sortedFields?.length) return;
    try {
      const fieldMap = new Map(sortedFields.map((f) => [f.field, f]));
      const payload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(values)) {
        const field = fieldMap.get(key);
        if (!field) continue;
        if (field.type === "BOOLEAN") {
          payload[key] = value === true || value === "true" || value === 1;
        } else if (NUMBER_TYPES.has(field.type)) {
          const num = value === "" || value == null ? null : Number(value);
          payload[key] = Number.isNaN(num) ? null : num;
        } else {
          payload[key] = value;
        }
      }

      for (const [key, files] of Object.entries(filesFieldData)) {
        payload[key] = files.map((f) => f.id);
      }

      const result = (await createItemMutation.mutateAsync(payload)) as Item;
      onItemCreated(result.id);
      onClose();
    } catch (e) {}
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="inset-x-auto right-0 top-0 mt-0 h-full w-full min-w-[770px] max-w-[770px] rounded-none border-l bg-white [&>button]:hidden">
        <DrawerTitle className="sr-only">Create item</DrawerTitle>
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
          <div className="flex h-[54px] shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4">
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Create {collectionName}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={createItemMutation.isPending || fieldsLoading}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  createItemMutation.isPending || fieldsLoading
                    ? "bg-[#E5E7EB] text-[#9CA3AF]"
                    : "bg-primary text-white hover:bg-[#e04342]"
                }`}
                title="Create item"
              >
                {createItemMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {fieldsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : sortedFields.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-[#9CA3AF]">
                  No fields defined for this collection.
                </p>
              </div>
            ) : (
              <form
                id="create-related-item-form"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="grid grid-cols-2 gap-4">
                  {sortedFields.map((field) => {
                    if (field.meta.interface === "files") {
                      return (
                        <div key={field.field} className="col-span-2 space-y-2">
                          <FilesField
                            field={field}
                            files={filesFieldData[field.field] || []}
                            onUploadClick={() => handleUploadClick(field.field)}
                            onLibraryClick={() =>
                              setLibraryPickerField(field.field)
                            }
                            onRemove={(fileId) =>
                              handleFileRemove(field.field, fileId)
                            }
                          />
                        </div>
                      );
                    }

                    const colSpan =
                      field.meta.width?.toLowerCase() === "half"
                        ? "col-span-1"
                        : "col-span-2";
                    return (
                      <div key={field.field} className={colSpan}>
                        <ItemFormField
                          field={field}
                          value={values[field.field]}
                          onChange={(v) =>
                            setValues((prev) => ({ ...prev, [field.field]: v }))
                          }
                          collectionName={collectionName}
                          fileInfos={fileInfos}
                          filesFieldData={filesFieldData}
                          onUploadClick={handleUploadClick}
                          onLibraryClick={(fn) => setLibraryPickerField(fn)}
                          onFileRemove={handleFileRemove}
                        />
                      </div>
                    );
                  })}
                </div>
              </form>
            )}
          </div>
        </div>
      </DrawerContent>
      <FileLibraryDrawer
        open={!!libraryPickerField}
        selectedId={
          libraryPickerField ? (values[libraryPickerField] as string) : null
        }
        onSelect={(fileId) => handleLibrarySelect(libraryPickerField!, fileId)}
        onClose={() => setLibraryPickerField(null)}
      />
    </Drawer>
  );
}
