import apiClient from "./client";
import type { CollectionResponse, CreateCollectionPayload } from "@/types/api";

export async function fetchCollections(): Promise<CollectionResponse[]> {
  const { data } = await apiClient.get("/collections");
  return data as CollectionResponse[];
}

export async function fetchCollection(id: number): Promise<CollectionResponse> {
  const { data } = await apiClient.get(`/collections/${id}`);
  return data as CollectionResponse;
}

export async function createCollection(payload: CreateCollectionPayload): Promise<CollectionResponse> {
  const { data } = await apiClient.post("/collections", payload);
  return data as CollectionResponse;
}

export async function deleteCollection(id: number): Promise<void> {
  await apiClient.delete(`/collections/${id}`);
}
