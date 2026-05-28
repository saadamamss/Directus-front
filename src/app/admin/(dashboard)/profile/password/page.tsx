"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { useChangePassword } from "@/lib/query/hooks/users";
import PageHeader from "@/components/layout/PageHeader";

export default function ChangePasswordPage() {
  const changePasswordMutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const handleChangePassword = async () => {
    setPassError("");
    setPassSuccess("");

    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPassError("Password must be at least 8 characters");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      setPassSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPassError("Failed to change password. Check your current password.");
    }
  };

  return (
    <>
      <PageHeader>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#E4EAF1] p-2">
            <KeyRound className="h-4 w-4 text-[#6B7280]" />
          </span>
          <div>
            <span className="block text-xs font-bold leading-3 text-[#a2b5cd]">
              Admin
            </span>
            <h1 className="text-[16px] font-semibold text-[#111827]">
              Change Password
            </h1>
          </div>
        </div>
      </PageHeader>

      <div className="w-full overflow-y-auto">
        <div className="mr-auto w-full max-w-2xl flex-1 px-4 py-8">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-[#111827]">
              Change Password
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-sm text-[#111827] outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-sm text-[#111827] outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-sm text-[#111827] outline-none focus:border-primary"
                />
              </div>

              {passError && (
                <p className="text-sm text-red-500">{passError}</p>
              )}
              {passSuccess && (
                <p className="text-sm text-green-600">{passSuccess}</p>
              )}

              <button
                onClick={handleChangePassword}
                disabled={
                  changePasswordMutation.isPending ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="flex h-10 items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:opacity-50"
              >
                {changePasswordMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
