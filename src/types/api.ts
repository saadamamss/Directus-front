import type { FieldResponse } from "@/lib/api/fields";

export interface CollectionMeta {
  id: number;
  name: string;
  tableName: string;
  singleton: boolean;
  primaryKey: string;
  pkType: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionSchema {
  [key: string]: unknown;
}

export interface CollectionResponse {
  collection: string;
  meta: CollectionMeta;
  schema: CollectionSchema;
}

export interface CreateCollectionMetaPayload {
  primaryKey?: string;
  pkType?: "auto-increment" | "uuid" | "string";
}

export interface CreateCollectionSchemaPayload {
  status?: boolean;
  sort?: boolean;
  dateCreated?: boolean;
  userCreated?: boolean;
  dateUpdated?: boolean;
  userUpdated?: boolean;
}

export interface CreateCollectionPayload {
  collection: string;
  meta?: CreateCollectionMetaPayload;
  schema?: CreateCollectionSchemaPayload;
}

export interface Item {
  id: number;
  [key: string]: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
