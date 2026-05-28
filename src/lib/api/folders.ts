import apiClient from "./client";

export interface FolderMeta {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  children: FolderMeta[];
}

export async function fetchFolders(parentId?: string | null): Promise<FolderMeta[]> {
  const params: Record<string, string> = {};
  if (parentId !== undefined) {
    if (parentId) params.parentId = parentId;
    else params.parentId = "";
  }
  const { data } = await apiClient.get("/folders", { params });
  return data;
}

export async function fetchFolderTree(): Promise<FolderMeta[]> {
  const { data } = await apiClient.get("/folders/tree");
  return data;
}

export async function createFolder(name: string, parentId?: string): Promise<FolderMeta> {
  const { data } = await apiClient.post("/folders", { name, parentId });
  return data;
}

export async function updateFolder(id: string, payload: { name?: string; parentId?: string | null }): Promise<FolderMeta> {
  const { data } = await apiClient.patch(`/folders/${id}`, payload);
  return data;
}

export async function deleteFolder(id: string): Promise<void> {
  await apiClient.delete(`/folders/${id}`);
}

export async function deleteFolders(ids: string[]): Promise<void> {
  await apiClient.post("/folders/delete", { ids });
}

export async function fetchFolderAncestors(id: string): Promise<FolderMeta[]> {
  const { data } = await apiClient.get(`/folders/${id}/ancestors`);
  return data;
}
