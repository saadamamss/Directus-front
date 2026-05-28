import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFields,
  fetchField,
  createField,
  updateField,
  deleteField,
  reorderFields,
  FieldResponse,
  CreateFieldPayload,
  UpdateFieldPayload,
  ReorderFieldDto,
} from "@/lib/api/fields";
import { useAppStore } from "@/stores/appStore";

export function useFields(collectionId?: number) {
  return useQuery<FieldResponse[]>({
    queryKey: ["collections", collectionId, "fields"],
    queryFn: () => fetchFields(collectionId!),
    enabled: !!collectionId,
  });
}

export function useField(collectionId: number, fieldId: number) {
  return useQuery<FieldResponse>({
    queryKey: ["collections", collectionId, "fields", fieldId],
    queryFn: () => fetchField(collectionId, fieldId),
    enabled: !!collectionId && !!fieldId,
  });
}

export function useCreateField(collectionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFieldPayload) =>
      createField(collectionId, payload),
    onSuccess: (data) => {
      const store = useAppStore.getState();
      store.setFields([...store.fields, data]);
      queryClient.invalidateQueries({ queryKey: ["collections", collectionId, "fields"] });
      store.refreshRelations();
    },
  });
}

export function useUpdateField(collectionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, payload }: { fieldId: number; payload: UpdateFieldPayload }) =>
      updateField(collectionId, fieldId, payload),
    onSuccess: (data) => {
      const store = useAppStore.getState();
      store.setFields(store.fields.map((f) => (f.meta.id === data.meta.id ? data : f)));
      queryClient.invalidateQueries({ queryKey: ["collections", collectionId, "fields"] });
    },
  });
}

export function useReorderFields(collectionId: number) {
  const queryClient = useQueryClient();
  const queryKey = ["collections", collectionId, "fields"];

  return useMutation({
    mutationFn: (items: ReorderFieldDto[]) => reorderFields(collectionId, items),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<FieldResponse[]>(queryKey);
      queryClient.setQueryData<FieldResponse[]>(queryKey, (old) => {
        if (!old) return old;
        const map = new Map(items.map((i) => [i.id, i.sortOrder]));
        return [...old].sort((a, b) => (map.get(a.meta.id) ?? a.meta.sortOrder ?? 0) - (map.get(b.meta.id) ?? b.meta.sortOrder ?? 0));
      });
      return { prev };
    },
    onError: (_err, _items, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSuccess: (_data, items) => {
      const store = useAppStore.getState();
      const orderMap = new Map(items.map((i) => [i.id, i.sortOrder]));
      store.setFields(
        store.fields.map((f) =>
          orderMap.has(f.meta.id)
            ? { ...f, meta: { ...f.meta, sortOrder: orderMap.get(f.meta.id)! } }
            : f,
        ),
      );
    },
  });
}

export function useDeleteField(collectionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: number) => deleteField(collectionId, fieldId),
    onSuccess: (_data, fieldId) => {
      const store = useAppStore.getState();
      store.setFields(store.fields.filter((f) => f.meta.id !== fieldId));
      queryClient.invalidateQueries({ queryKey: ["collections", collectionId, "fields"] });
      store.refreshRelations();
    },
  });
}
