"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useLogin } from "@/lib/query/hooks/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  useEffect(() => {
    if (loginMutation.error) {
      toast.error(
        loginMutation.error instanceof Error
          ? loginMutation.error.message
          : "Invalid email or password",
      );
    }
  }, [loginMutation.error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* LEFT PANEL - Form */}
      <div className="relative flex w-full flex-col bg-[#F9FAFB] px-16 min-[480px]:w-[480px]">
        {/* Logo - Top */}
        <div className="flex items-center gap-3 pt-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary p-2">
            <Logo />
          </div>
          <div>
            <p className="text-[18px] font-semibold text-[#111827]">
              DataForge
            </p>
            <p className="text-[14px] text-[#9CA3AF]">Application</p>
          </div>
        </div>

        {/* Form - Vertically Centered */}
        <div className="flex flex-1 flex-col justify-center">
          <form onSubmit={handleSubmit}>
            <h1 className="mb-8 text-[32px] font-bold text-[#111827]">
              Sign In
            </h1>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-[54px] w-full rounded-md border-[2px] border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-[54px] w-full rounded-md border-[2px] border-[#E5E7EB] bg-white px-4 pr-10 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="flex h-[40px] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-white transition-all hover:bg-[#e04342] disabled:opacity-70"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <a
                href="#"
                className="flex h-[40px] items-center justify-center text-sm text-[#6B7280] transition-colors hover:text-[#374151]"
              >
                Forgot Password
              </a>
            </div>
          </form>
        </div>

        {/* Bottom Status */}
        <p className="pb-12 text-sm text-[#9CA3AF]">Signed out</p>
      </div>

      {/* RIGHT PANEL - Gradient */}
      <div
        className="hidden flex-1 min-[480px]:block"
        style={{
          background:
            "linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #F25453 100%)",
        }}
      />
    </div>
  );
}
