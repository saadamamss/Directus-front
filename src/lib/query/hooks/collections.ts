import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCollections,
  fetchCollection,
  createCollection,
  deleteCollection,
} from "@/lib/api/collections";
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

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCollectionPayload) => createCollection(payload),
    onSuccess: (data) => {
      const store = useAppStore.getState();
      store.setCollections([data, ...store.collections]);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: (_data, id) => {
      const store = useAppStore.getState();
      store.setCollections(store.collections.filter((c) => c.meta.id !== id));
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
