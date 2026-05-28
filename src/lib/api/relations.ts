import apiClient from "./client";

export interface RelationMeta {
  id: number;
  manyCollection: string;
  manyField: string;
  oneCollection: string;
  oneField: string | null;
  oneDeselectAction: string | null;
  junctionField: string | null;
}

export interface RelationSchema {
  constraintName: string | null;
  table: string | null;
  column: string | null;
  foreignKeySchema: string | null;
  foreignKeyTable: string | null;
  foreignKeyColumn: string | null;
  onUpdate: string | null;
  onDelete: string | null;
  junctionCollection: string | null;
  junctionField: string | null;
  relatedJunctionField: string | null;
}

export interface RelationResponse {
  collection: string;
  field: string;
  relatedCollection: string;
  meta: RelationMeta;
  schema: RelationSchema;
}

export async function fetchRelations(): Promise<RelationResponse[]> {
  const { data } = await apiClient.get("/relations");
  return data as RelationResponse[];
}
