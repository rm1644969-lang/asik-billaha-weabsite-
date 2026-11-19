"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Terminal, Lock, Mail, ArrowRight, ShieldCheck, User, Sparkles, CheckCircle2 } from "lucide-react";
import { useNexusStore } from "@/lib/store";

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="py-24 text-center text-yellow-400 font-mono">Loading login...</div>
    }>
      <LoginContent />
    </React.Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { loginUser, switchUserRole } = useNexusStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || "Login failed.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#070707]">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-red-600 to-black p-[2px] shadow-neon-yellow mb-2">
            <div className="w-full h-full bg-[#0a0a0a] rounded-[13px] flex items-center justify-center">
              <Terminal className="w-7 h-7 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gradient-shimmer">
            Toolsbd.com অ্যাকাউন্টে প্রবেশ করুন
          </h1>
          <p className="text-xs text-slate-300">
            আপনার Gmail দিয়ে লগইন করে সফটওয়্যার টুলস কিনুন, ওয়ালেটে ব্যালেন্স লোড করুন ও HWID কি সক্রিয় করুন।
          </p>
        </div>

        {/* Login Form Container */}
        <div className="rounded-3xl p-6 sm:p-8 space-y-6 bg-[#0c0c0c] border border-white/10 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500 text-white text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                আপনার Gmail এড্রেস
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-yellow-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-white font-medium placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="আপনার পাসওয়ার্ড দিন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-white font-medium placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black font-black text-xs sm:text-sm shadow-neon-yellow hover:opacity-95 flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>{loading ? "প্রবেশ হচ্ছে..." : "লগইন করে এগিয়ে যান"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
            এখনও কোনো অ্যাকাউন্ট নেই?{" "}
            <Link 
              href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="text-yellow-400 font-black hover:underline"
            >
              নতুন রেজিস্ট্রেশন করুন
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
