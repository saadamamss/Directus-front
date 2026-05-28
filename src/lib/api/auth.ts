import apiClient from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function loginUser(payload: LoginPayload) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}

export async function logoutUser() {
  const { data } = await apiClient.post("/auth/logout");
  return data;
}

export async function refreshSession() {
  const { data } = await apiClient.post("/auth/refresh");
  return data;
}
