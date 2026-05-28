"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { setLastCollectionCookie } from "@/lib/lastCollection";
import {
  useItem,
  useCreateItem,
  useUpdateItem,
  useDeleteItems,
} from "@/lib/query/hooks/items";
import { uploadFile, fetchFileInfo } from "@/lib/api/upload";
import type { FileInfo } from "@/lib/api/upload";
import type { FieldResponse } from "@/lib/api/fields";
import { NUMBER_TYPES } from "@/shared/constants/fieldTypes";

export function useItemForm() {
  const params = useParams();
  const router = useRouter();
  const collectionName = params.collection as string;
  const itemId = params.id as string;
  const isCreate = itemId === "%2B";
  const { setLastAccessedCollection, collections, fields: allFields, initialized } = useAppStore();
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

  const collection = collections?.find((c) => c.meta.name === collectionName);
  const collectionId = collection?.meta.id;

  const fields = useMemo(
    () => allFields.filter((f) => f.meta.collectionId === collectionId),
    [allFields, collectionId],
  );
  const queryItemId = isCreate ? 0 : Number(itemId);
  const { data: itemData, isLoading: itemLoading } = useItem(
    collectionName,
    queryItemId,
  );

  const createItemMutation = useCreateItem(collectionName);
  const updateItemMutation = useUpdateItem(collectionName);
  const deleteItemsMutation = useDeleteItems(collectionName);

  useEffect(() => {
    if (isCreate) {
      const initial: Record<string, unknown> = {};
      for (const field of fields) {
        const raw = field.schema.defaultValue;
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
  }, [isCreate, fields]);

  useEffect(() => {
    if (itemData) {
      const { id: _, ...rest } = itemData;
      setValues(rest);
    }
  }, [itemData]);

  const imageFields = fields.filter((f) => f.meta.interface === "image");
  const filesFields = fields.filter((f) => f.meta.interface === "files");

  useEffect(() => {
    for (const field of imageFields) {
      const id = values[field.field];
      if (typeof id === "string" && id && !fileInfos[id]) {
        fetchFileInfo(id)
          .then((info) => {
            setFileInfos((prev) => ({ ...prev, [id]: info }));
          })
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
    const field = fields.find((f) => f.field === fieldName);
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

    const field = fields.find((f) => f.field === uploadingField);
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
    const field = fields.find((f) => f.field === fieldName);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldMap = new Map(
      fields.map((f: FieldResponse) => [f.field, f]),
    );
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

    try {
      if (isCreate) {
        await createItemMutation.mutateAsync(payload);
      } else {
        await updateItemMutation.mutateAsync({ id: Number(itemId), payload });
      }
      setLastCollectionCookie(collectionName);
      setLastAccessedCollection(collectionName);
      router.push(`/admin/content/${collectionName}`);
    } catch {
      /* error handled by react query */
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteItemsMutation.mutateAsync([Number(itemId)]);
      router.push(`/admin/content/${collectionName}`);
    } catch {
      /* error handled by react query */
    }
  };

  const saving = createItemMutation.isPending || updateItemMutation.isPending;
  const needsValues =
    !isCreate && !!itemData && Object.keys(values).length === 0;
  const loading = !initialized || (!isCreate && itemLoading) || needsValues;

  const title = isCreate
    ? `New ${collectionName?.charAt(0).toUpperCase() + collectionName?.slice(1)}`
    : `Edit ${itemId}`;

  const sortedFields = [...fields]
    .filter((f) => !f.meta.isSystem)
    .sort((a, b) => (a.meta.sortOrder ?? 0) - (b.meta.sortOrder ?? 0));

  return {
    isCreate,
    collectionName,
    itemId,
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
  };
}
