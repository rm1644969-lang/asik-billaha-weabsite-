"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Lock, Mail, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useNexusStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { switchUserRole } = useNexusStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    switchUserRole("customer");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 p-[1px] shadow-neon-purple mb-2">
            <div className="w-full h-full bg-[#080c2e] rounded-[15px] flex items-center justify-center">
              <Terminal className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white">Create Your Account</h1>
          <p className="text-xs text-slate-400">
            Join Nexus Tools for automated license delivery & instant downloads.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 shadow-2xl">
          
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Asik Billah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. asik@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
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
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
