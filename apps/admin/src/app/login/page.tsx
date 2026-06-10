"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { Map, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    startTransition(async () => {
      try {
        const success = await login(email, password);
        if (success) {
          router.push("/");
          router.refresh();
        } else {
          setErrorMsg("Invalid administrative email or password.");
        }
      } catch (err: any) {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-500 shadow-lg shadow-teal-500/30">
            <Map className="h-9 w-9 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-white">
            FutoNav Administrator
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400 font-semibold">
            Sign in to manage FUTO campus navigation assets
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border border-slate-700/60 shadow-xl">
          {errorMsg && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex gap-2.5 items-start text-sm font-semibold text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900/60 pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors font-semibold"
                  placeholder="admin@futonav.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900/60 pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center rounded-xl bg-teal-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-500/20 hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
