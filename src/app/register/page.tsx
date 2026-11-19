"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Terminal, Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useNexusStore } from "@/lib/store";

export default function RegisterPage() {
  return (
    <React.Suspense fallback={
      <div className="py-24 text-center text-yellow-400 font-mono">Loading register...</div>
    }>
      <RegisterContent />
    </React.Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { registerUser } = useNexusStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid Gmail address.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    const res = registerUser(name, email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || "Registration failed.");
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
          <h1 className="text-3xl font-black text-white">
            Create Toolsbd<span className="text-red-500">.com</span> Account
          </h1>
          <p className="text-xs text-slate-300">
            Register your Gmail account to save your wallet balance, purchases, and HWID keys.
          </p>
        </div>

        {/* Register Form Container */}
        <div className="rounded-3xl p-6 sm:p-8 space-y-6 bg-[#0c0c0c] border border-white/10 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500 text-white text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-yellow-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Asik Billah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-white font-medium placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                Gmail Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-yellow-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-white font-medium placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 4 characters"
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
              <span>{loading ? "Creating Account..." : "Create Account & Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link 
              href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="text-yellow-400 font-black hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
