import apiClient from "./client";

export interface FileInfo {
  id: string;
  filename_disk: string;
  filename_download: string;
  type: string;
  filesize: number;
  width: number | null;
  height: number | null;
  url: string;
}

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function isImageType(mime: string): boolean {
  return IMAGE_TYPES.has(mime);
}

export async function uploadFile(file: File): Promise<FileInfo> {
  const formData = new FormData();
  formData.append("file", file);
  const endpoint = isImageType(file.type) ? "/upload/image" : "/upload/file";
  const { data } = await apiClient.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** @deprecated Use `uploadFile` instead */
export const uploadImage = uploadFile;

export async function fetchFileInfo(id: string): Promise<FileInfo> {
  const { data } = await apiClient.get(`/upload/files/${id}`);
  return data;
}

export async function fetchFiles(folderId?: string | null): Promise<FileInfo[]> {
  const params: Record<string, string> = {};
  if (folderId !== undefined) {
    if (folderId) params.folderId = folderId;
    else params.folderId = "";
  }
  const { data } = await apiClient.get("/upload/files", { params });
  return data;
}

export async function moveFiles(fileIds: string[], folderId: string | null): Promise<void> {
  await apiClient.patch("/upload/files/move", { fileIds, folderId });
}

export async function deleteFiles(fileIds: string[]): Promise<void> {
  await apiClient.post("/upload/files/delete", { fileIds });
}
