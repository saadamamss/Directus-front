import apiClient from "./client";

export interface Item {
  id: number;
  [key: string]: unknown;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  totalPages: number;
}

export async function fetchItems(
  collectionName: string,
  params?: { page?: number; limit?: number; search?: string }
): Promise<ItemsResponse> {
  const { data } = await apiClient.get(`/items/${collectionName}`, { params });
  return data;
}

export async function fetchItem(collectionName: string, id: number): Promise<Item> {
  const { data } = await apiClient.get(`/items/${collectionName}/${id}`);
  return data;
}

export async function createItem(collectionName: string, payload: Record<string, unknown>): Promise<Item> {
  const { data } = await apiClient.post(`/items/${collectionName}`, payload);
  return data;
}

export async function updateItem(collectionName: string, id: number, payload: Record<string, unknown>): Promise<Item> {
  const { data } = await apiClient.patch(`/items/${collectionName}/${id}`, payload);
  return data;
}

export async function deleteItems(collectionName: string, ids: number[]): Promise<void> {
  await apiClient.delete(`/items/${collectionName}`, { data: { ids } });
}
