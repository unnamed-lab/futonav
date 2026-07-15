"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { Map, Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
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
      } catch {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic ambient background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-teal-500/10 rounded-full blur-[140px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse-slow pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-slideUp">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-xl shadow-teal-500/20 hover:scale-105 transition-all duration-300">
            <Map className="h-9 w-9" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            FutoNav Admin
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-semibold tracking-wide flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
            <ShieldCheck className="h-4 w-4 text-teal-650" /> Administrative Telemetry Control
          </p>
        </div>

        {/* Login Card */}
        <form 
          onSubmit={handleSubmit} 
          className="mt-8 space-y-6 glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl bg-white/70 backdrop-blur-xl"
        >
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 flex gap-2.5 items-start text-sm font-bold text-red-800 animate-fadeIn">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-650 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold"
                  placeholder="admin@futonav.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 pl-12 pr-12 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center rounded-xl bg-teal-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-650/10 hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 transition-all duration-300 cursor-pointer hover:shadow-teal-500/25 active:scale-[0.98]"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

