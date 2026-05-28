import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser, LoginPayload } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (data) => {
      setUser(data);
      router.push("/admin/content");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      logout();
      router.push("/admin/login");
    },
  });
}
