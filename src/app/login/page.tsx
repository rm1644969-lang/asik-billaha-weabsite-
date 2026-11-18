"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Lock, Mail, ArrowRight, ShieldCheck, User } from "lucide-react";
import { useNexusStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { switchUserRole } = useNexusStore();
  const [email, setEmail] = useState("shakil.dev@gmail.com");
  const [password, setPassword] = useState("••••••••");
  const [role, setRole] = useState<"customer" | "admin">("customer");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchUserRole(role);
    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 p-[1px] shadow-neon-purple mb-2">
            <div className="w-full h-full bg-[#080c2e] rounded-[15px] flex items-center justify-center">
              <Terminal className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white">Sign In to Nexus</h1>
          <p className="text-xs text-slate-400">
            Access your purchased licenses, downloads, and payments.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 shadow-2xl">
          
          {/* Quick Demo Persona Switcher */}
          <div className="p-1 rounded-xl bg-black/40 border border-white/5 grid grid-cols-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setRole("customer");
                setEmail("shakil.dev@gmail.com");
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === "customer"
                  ? "bg-purple-600 text-white shadow-neon-purple"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setEmail("admin@nexustools.io");
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === "admin"
                  ? "bg-purple-600 text-white shadow-neon-purple"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner Admin</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-white font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-300">Password</label>
                <a href="#" className="text-purple-400 hover:underline text-[11px]">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-white font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-sm shadow-neon-purple hover:opacity-95 flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>Sign In as {role === "admin" ? "Owner Admin" : "Customer"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-cyan-400 font-bold hover:underline">
              Create Account
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
