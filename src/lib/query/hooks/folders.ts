import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFolders,
  fetchFolderTree,
  createFolder,
  updateFolder,
  deleteFolder,
  FolderMeta,
} from "@/lib/api/folders";

export function useFolders(parentId?: string | null) {
  return useQuery<FolderMeta[]>({
    queryKey: ["folders", "list", parentId],
    queryFn: () => fetchFolders(parentId),
  });
}

export function useFolderTree() {
  return useQuery<FolderMeta[]>({
    queryKey: ["folders", "tree"],
    queryFn: fetchFolderTree,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId?: string }) =>
      createFolder(name, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name?: string; parentId?: string | null }) =>
      updateFolder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
