import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchItems,
  fetchItem,
  createItem,
  updateItem,
  deleteItems,
  Item,
  ItemsResponse,
} from "@/lib/api/items";

export function useItems(collectionName: string, params?: { page?: number; limit?: number; search?: string }) {
  return useQuery<ItemsResponse>({
    queryKey: ["items", collectionName, params],
    queryFn: () => fetchItems(collectionName, params),
    enabled: !!collectionName,
  });
}

export function useItem(collectionName: string, id: number) {
  return useQuery<Item>({
    queryKey: ["items", collectionName, id],
    queryFn: () => fetchItem(collectionName, id),
    enabled: !!collectionName && !!id,
  });
}

export function useCreateItem(collectionName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => createItem(collectionName, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", collectionName] });
    },
  });
}

export function useUpdateItem(collectionName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      updateItem(collectionName, id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items", collectionName] });
      queryClient.invalidateQueries({ queryKey: ["items", collectionName, variables.id] });
    },
  });
}

export function useDeleteItems(collectionName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => deleteItems(collectionName, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", collectionName] });
    },
  });
}
