"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Calendar, Save, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUpdateUser } from "@/lib/query/hooks/users";
import PageHeader from "@/components/layout/PageHeader";

export default function AccountInfoPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const updateUserMutation = useUpdateUser();

  const [name, setName] = useState(user?.name ?? "");

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const handleSaveName = async () => {
    if (!name.trim() || name === user.name) return;
    try {
      await updateUserMutation.mutateAsync({ name });
    } catch {
      /* handled by react query */
    }
  };

  return (
    <>
      <PageHeader>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#E4EAF1] p-2">
            <User className="h-4 w-4 text-[#6B7280]" />
          </span>
          <div>
            <span className="block text-xs font-bold leading-3 text-[#a2b5cd]">
              Admin
            </span>
            <h1 className="text-[16px] font-semibold text-[#111827]">
              Account Information
            </h1>
          </div>
        </div>
      </PageHeader>

      <div className="w-full overflow-y-auto">
        <div className="mr-auto w-full max-w-2xl flex-1 px-4 py-8">
          <div className="mb-6 flex items-center gap-6 rounded-lg border border-[#E5E7EB] bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[#9CA3AF]" />
              <span className="text-sm text-[#6B7280]">{user.email}</span>
            </div>
            <div className="h-5 w-px bg-[#E5E7EB]" />
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-[#9CA3AF]" />
              <span className="text-sm text-[#6B7280]">
                {user.roles?.join(", ") || "User"}
              </span>
            </div>
            <div className="h-5 w-px bg-[#E5E7EB]" />
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-[#9CA3AF]" />
              <span className="text-sm text-[#6B7280]">Joined {joinedDate}</span>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-[#111827]">
              Profile Information
            </h3>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-sm text-[#111827] outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleSaveName}
                disabled={
                  updateUserMutation.isPending ||
                  !name.trim() ||
                  name === user.name
                }
                className="flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-[#e04342] disabled:opacity-50"
              >
                {updateUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
