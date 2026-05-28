import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCollections,
  fetchCollection,
  createCollection,
  deleteCollection,
} from "@/lib/api/collections";
import { fetchAllFields } from "@/lib/api/fields";
import { fetchRelations } from "@/lib/api/relations";
import { useAppStore } from "@/stores/appStore";
import type { CollectionResponse, CreateCollectionPayload } from "@/types/api";

export function useCollections() {
  return useQuery<CollectionResponse[]>({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });
}

export function useCollection(id: number) {
  return useQuery<CollectionResponse>({
    queryKey: ["collections", id],
    queryFn: () => fetchCollection(id),
    enabled: !!id,
  });
}

async function refreshFieldsAndRelations() {
  const store = useAppStore.getState();
  const [fields, relations] = await Promise.all([
    fetchAllFields(),
    fetchRelations(),
  ]);
  store.setFields(fields);
  store.setRelations(relations);
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCollectionPayload) => createCollection(payload),
    onSuccess: async (data) => {
      const store = useAppStore.getState();
      store.setCollections([data, ...store.collections]);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      await refreshFieldsAndRelations();
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: async (_data, id) => {
      const store = useAppStore.getState();
      store.setCollections(store.collections.filter((c) => c.meta.id !== id));
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      await refreshFieldsAndRelations();
    },
  });
}
