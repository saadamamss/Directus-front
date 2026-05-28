"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const { isPending, isFetched, data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isFetched && !data) {
      router.push("/admin/login");
    }
  }, [isFetched, data, router]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return <>{children}</>;
}
