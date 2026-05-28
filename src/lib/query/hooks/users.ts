import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, changePassword, type UpdateUserPayload } from "@/lib/api/users";
import { useAuthStore } from "@/stores/authStore";

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(user!.id, payload),
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      changePassword(payload),
  });
}
