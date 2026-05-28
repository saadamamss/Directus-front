import apiClient from "./client";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  emailVerified: boolean;
  roles: string[];
  createdAt: string;
}

export interface UpdateUserPayload {
  name?: string;
  avatar?: string;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const { data } = await apiClient.post("/auth/change-password", payload);
  return data;
}
