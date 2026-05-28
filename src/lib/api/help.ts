import apiClient from "./client";

export interface FieldType {
  id: number;
  value: string;
  label: string;
  dbType: string;
  formComponent: string;
  inputType: string;
}

export async function fetchFieldTypes(): Promise<FieldType[]> {
  const { data } = await apiClient.get("/help/field-types");
  return data as FieldType[];
}
