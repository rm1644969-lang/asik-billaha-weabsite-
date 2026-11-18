"use client";

import React from "react";
import { Users, Key, Zap, Send } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      label: "Daily Active Visitors",
      value: "12,000+",
      subtext: "High-concurrency infrastructure",
      icon: Users,
      glowColor: "rgba(250, 204, 21, 0.45)",
      textColor: "text-yellow-400"
    },
    {
      label: "Licenses Generated",
      value: "4,850+",
      subtext: "HWID cryptographically locked",
      icon: Key,
      glowColor: "rgba(239, 68, 68, 0.45)",
      textColor: "text-red-500"
    },
    {
      label: "Avg. Payment Verification",
      value: "< 45s",
      subtext: "bKash & Rocket SMS companion",
      icon: Zap,
      glowColor: "rgba(255, 255, 255, 0.4)",
      textColor: "text-white"
    },
    {
      label: "Telegram VIP Members",
      value: "15,200+",
      subtext: "Active tools community",
      icon: Send,
      glowColor: "rgba(250, 204, 21, 0.45)",
      textColor: "text-yellow-400"
    }
  ];

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-[#090909]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="relative rounded-2xl p-5 bg-[#0e0e0e] border border-white/10 hover:border-yellow-400/40 transition-all group overflow-hidden"
              >
                {/* Glow dot */}
                <div 
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-35 group-hover:opacity-75 transition-opacity pointer-events-none"
                  style={{ backgroundColor: stat.glowColor }}
                />

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>

                <div className={`text-3xl sm:text-4xl font-black tracking-tight ${stat.textColor}`}>
                  {stat.value}
                </div>

                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {stat.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
