"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, UserPlus, Lock, Mail, Loader2, ArrowLeft, User } from "lucide-react";
import { useAppStore } from "../store";
import { API_URL } from "@/lib/api";


export default function RegisterPage() {
  const router = useRouter();
  const { setToken, setUser, setGuestMode, habits, matrixTasks, pomodoroSessions, inboxItems } = useAppStore();
  
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, user_name: userName }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Registration failed. Try a different email.");
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);

      // Perform initial cloud sync: push current guest data to new cloud account
      try {
        await fetch(`${API_URL}/api/sync`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${data.token}`
          },
          body: JSON.stringify({ habits, matrixTasks, pomodoroSessions, inboxItems }),
        });
      } catch (syncErr) {
        console.error("Initial cloud sync failed:", syncErr);
      }

      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#0F0C20] dark:via-[#151030] dark:to-[#0A0718]">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/70 dark:bg-white/[0.02] border border-white/40 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/20 dark:bg-indigo-500/10 blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-primary/20 dark:bg-primary/10 blur-[80px]" />

        {/* Brand */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white shadow-lg mb-3">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-500 dark:text-[#8E8EA8] mt-1.5">Start syncing your cognitive space to the cloud</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* User Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-[#A0A0C0]">Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6B6B8A]" size={16} />
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Youssef Ali"
                className="w-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-[#5B5B7A] transition-colors shadow-sm dark:shadow-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-[#A0A0C0]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6B6B8A]" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-[#5B5B7A] transition-colors shadow-sm dark:shadow-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-[#A0A0C0]">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6B6B8A]" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-[#5B5B7A] transition-colors shadow-sm dark:shadow-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-primary hover:from-indigo-400 hover:to-primary-hover text-white text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <UserPlus size={16} /> Get Started
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.06] text-center relative z-10">
          <p className="text-xs text-slate-500 dark:text-[#8E8EA8]">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-bold transition-colors inline-flex items-center gap-0.5">
              <ArrowLeft size={12} className="mr-0.5" /> Log In
            </Link>
          </p>
          <div className="mt-4">
            <button 
              onClick={() => {
                setGuestMode(true);
                router.push("/");
              }}
              className="text-[11px] text-slate-400 dark:text-[#6B6B8A] hover:text-slate-600 dark:hover:text-text-muted transition-colors"
            >
              Continue in Guest / Offline Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
