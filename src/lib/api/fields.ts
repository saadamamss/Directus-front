import apiClient from "./client";

export interface FieldMeta {
  id: number;
  collectionId: number;
  name: string;
  label: string;
  required: boolean;
  sortOrder: number;
  hidden: boolean;
  readonly: boolean;
  searchable: boolean;
  width: string;
  note: string | null;
  interface: string | null;
  special: string | null;
  options: Record<string, unknown> | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FieldSchema {
  dbType: string;
  defaultValue: string | null;
  maxLength: number | null;
  isUnique: boolean;
  isIndexed: boolean;
  isNullable: boolean;
}

export interface FieldResponse {
  collection: string;
  field: string;
  type: string;
  meta: FieldMeta;
  schema: FieldSchema;
}

export interface ReorderFieldDto {
  id: number;
  sortOrder: number;
}

export interface FieldMetaPayload {
  interface?: string;
  width?: string;
  required?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  searchable?: boolean;
  note?: string;
  options?: Record<string, unknown>;
}

export interface FieldSchemaPayload {
  name?: string;
  table?: string;
  dataType?: string;
  defaultValue?: string;
  maxLength?: number;
  isNullable?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
}

export interface RelationDto {
  type: string;
  relatedCollection: string;
  foreignKey?: string;
  junctionCollection?: string;
  junctionField?: string;
  relatedJunctionField?: string;
  onDeselect?: string;
  onDelete?: string;
  onDeleteRelated?: string;
}

export interface CreateFieldPayload {
  field: string;
  type: string;
  meta?: FieldMetaPayload;
  schema?: FieldSchemaPayload;
  relation?: RelationDto;
}

export interface UpdateFieldPayload {
  field?: string;
  type?: string;
  label?: string;
  meta?: FieldMetaPayload;
  schema?: FieldSchemaPayload;
}

export async function fetchFields(collectionId: number): Promise<FieldResponse[]> {
  const { data } = await apiClient.get(`/collections/${collectionId}/fields`);
  return data;
}

export async function fetchAllFields(): Promise<FieldResponse[]> {
  const { data } = await apiClient.get("/fields");
  return data;
}

export async function fetchField(collectionId: number, fieldId: number): Promise<FieldResponse> {
  const { data } = await apiClient.get(`/collections/${collectionId}/fields/${fieldId}`);
  return data;
}

export async function createField(
  collectionId: number,
  payload: CreateFieldPayload
): Promise<FieldResponse> {
  const { data } = await apiClient.post(`/collections/${collectionId}/fields`, payload);
  return data;
}

export async function updateField(
  collectionId: number,
  fieldId: number,
  payload: UpdateFieldPayload
): Promise<FieldResponse> {
  const { data } = await apiClient.patch(`/collections/${collectionId}/fields/${fieldId}`, payload);
  return data;
}

export async function deleteField(collectionId: number, fieldId: number): Promise<void> {
  await apiClient.delete(`/collections/${collectionId}/fields/${fieldId}`);
}

export async function reorderFields(
  collectionId: number,
  items: ReorderFieldDto[]
): Promise<void> {
  await apiClient.patch(`/collections/${collectionId}/fields/sort/reorder`, items);
}
