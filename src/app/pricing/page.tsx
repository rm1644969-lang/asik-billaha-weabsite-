"use client";

import React from "react";
import { useNexusStore } from "@/lib/store";
import PricingCard from "@/components/PricingCard";
import Card3D from "@/components/Card3D";
import CyberCanvas3D from "@/components/CyberCanvas3D";
import { Sparkles, ShieldCheck, Zap, HelpCircle } from "lucide-react";

export default function PricingPage() {
  const { plans } = useNexusStore();
  const activePlans = plans.filter(p => p.enabled);

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-14 overflow-hidden">
      
      {/* 3D Ambient Cyber Canvas */}
      <CyberCanvas3D className="absolute -top-10 left-0 right-0 h-[480px] pointer-events-none opacity-50 z-0" />

      <div className="relative z-10 space-y-14">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500 text-yellow-400 text-xs font-black uppercase tracking-widest shadow-neon-red">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Special Limited Offer</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gradient-gold-fire">
          TOOLS OFFER PRICE 🔊
        </h1>
        <p className="text-slate-300 text-base sm:text-lg font-semibold leading-relaxed">
          7 DAYS — <span className="text-yellow-400 font-black drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">$2 🔥</span> &nbsp;|&nbsp; 15 DAYS — <span className="text-yellow-400 font-black drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">$4 🔥</span> &nbsp;|&nbsp; 30 DAYS — <span className="text-yellow-400 font-black drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">$8 🔥</span>
        </p>
        <p className="text-slate-400 text-sm">
          Instant automated license delivery via bKash (<span className="text-yellow-400 font-mono font-bold">01967922602</span>) &amp; Rocket (<span className="text-red-400 font-mono font-bold">01731328169</span>).
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activePlans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Features Included with Every Plan */}
      <div className="rounded-3xl p-8 bg-[#0e0e0e] border border-white/10 space-y-6">
        <h3 className="text-xl font-black text-white text-center">
          Every License Includes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <Card3D maxTilt={10} depth={1.04} glare={true} className="h-full">
            <div className="space-y-2 p-4 rounded-xl bg-black border border-white/10 h-full">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h4 className="font-bold text-white text-sm">Instant Delivery</h4>
              <p className="text-slate-400">License keys are issued immediately after bKash/Rocket TrxID auto-match.</p>
            </div>
          </Card3D>
          <Card3D maxTilt={10} depth={1.04} glare={true} className="h-full">
            <div className="space-y-2 p-4 rounded-xl bg-black border border-white/10 h-full">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <h4 className="font-bold text-white text-sm">HWID Machine Lock</h4>
              <p className="text-slate-400">Protects your license key against theft or unauthorized sharing.</p>
            </div>
          </Card3D>
          <Card3D maxTilt={10} depth={1.04} glare={true} className="h-full">
            <div className="space-y-2 p-4 rounded-xl bg-black border border-white/10 h-full">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h4 className="font-bold text-white text-sm">1-Click HWID Reset</h4>
              <p className="text-slate-400">Upgrade your PC or reinstall Windows without buying a new license.</p>
            </div>
          </Card3D>
          <Card3D maxTilt={10} depth={1.04} glare={true} className="h-full">
            <div className="space-y-2 p-4 rounded-xl bg-black border border-white/10 h-full">
              <HelpCircle className="w-5 h-5 text-white" />
              <h4 className="font-bold text-white text-sm">24/7 Telegram VIP</h4>
              <p className="text-slate-400">Direct setup and technical help from the Toolsbd.com owner anytime.</p>
            </div>
          </Card3D>
        </div>
      </div>

      </div>
    </div>
  );
}
