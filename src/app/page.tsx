"use client";

import React from "react";
import Link from "next/link";
import Hero3D from "@/components/Hero3D";
import ToolCard from "@/components/ToolCard";
import StatsSection from "@/components/StatsSection";
import { useNexusStore } from "@/lib/store";
import { 
  Send, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  Activity,
  Zap,
  Sparkles,
  Check
} from "lucide-react";

export default function HomePage() {
  const { tools, plans, settings } = useNexusStore();

  return (
    <div className="relative overflow-hidden bg-[#070707]">
      
      {/* ============================================================== */}
      {/* SECTION 1: 3D HERO SECTION (COMPACT & SEAMLESS)                 */}
      {/* ============================================================== */}
      <section className="relative pt-6 pb-6 px-4 sm:px-6 lg:px-8 overflow-hidden bg-hero-gradient">
        
        {/* 3D WebGL Canvas Layer (Cyber Robotic AI Sentinel Eye) */}
        <Hero3D />

        {/* Ambient Subtle Glows */}
        <div className="absolute top-1/4 left-10 w-80 h-80 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-4 right-10 w-80 h-80 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[380px] lg:min-h-[440px]">
          
          {/* Hero Copy (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Professional Software Tools &{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-white to-red-500 bg-clip-text text-transparent">
                Automated Licensing
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed mx-auto lg:mx-0 font-normal">
              {settings.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link
                href="/tools"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-black text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:opacity-95 shadow-neon-yellow flex items-center justify-center gap-2 group transition-all"
              >
                <span>Browse All Tools</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href={settings.telegramGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-black text-white bg-red-950/80 hover:bg-red-900 border border-red-500 hover:border-red-400 flex items-center justify-center gap-2 transition-all shadow-neon-red"
              >
                <Send className="w-4 h-4 text-red-400" />
                <span>Join Official Telegram</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[11px] sm:text-xs text-slate-300 border-t border-white/10">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                <span>bKash (01967922602) &amp; Rocket (01731328169)</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                <span>Single PC Permanent HWID Security</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Activity className="w-3.5 h-3.5 text-white" />
                <span>10k-12k Daily Traffic Scale</span>
              </span>
            </div>

          </div>

          {/* Right 5 Cols: Visual placeholder for 3D Cyber Eye (interactively tracks mouse) */}
          <div className="hidden lg:block lg:col-span-5 h-[360px] pointer-events-none" />

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: TOOL ON LEFT + PRICE LIST ON RIGHT (SIDE BY SIDE)    */}
      {/* ============================================================== */}
      <section id="offer-prices" className="pt-4 pb-14 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto scroll-mt-20">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-400 mb-1">
              <Layers className="w-4 h-4 text-red-500" />
              <span>Flagship Release</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Our Official Software Tool &amp; Offer Price List
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Independently tested, HWID protected, and delivered instantaneously upon bKash ({settings.bkashMerchantNumber}) or Rocket ({settings.rocketMerchantNumber}) confirmation.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <span>Full Specifications</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Side-by-Side Grid: Tool Card (Left) + Price List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT: Official Tool Card */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            {tools[0] && <ToolCard tool={tools[0]} />}
          </div>

          {/* RIGHT: TOOLS OFFER PRICE List Panel */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-yellow-400/80 via-red-500/50 to-yellow-600/30 shadow-2xl h-full flex flex-col">
              <div className="rounded-2xl bg-[#090909]/95 backdrop-blur-xl p-5 sm:p-6 h-full flex flex-col justify-between space-y-6 border border-white/10">
                
                {/* Price List Header */}
                <div className="text-center space-y-1.5 pb-2 border-b border-white/10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/60 text-yellow-400 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Instant bKash &bull; Rocket Verification &bull; Zero Delay</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                    <span>TOOLS OFFER PRICE</span>
                    <span className="text-xl">📢</span>
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-yellow-400 tracking-wide">
                    7 DAYS &mdash; $2 🔥 &nbsp;|&nbsp; 15 DAYS &mdash; $4 🔥 &nbsp;|&nbsp; 30 DAYS &mdash; $8 🔥
                  </p>
                </div>

                {/* 3 Price Cards Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1 items-stretch">
                  {plans.filter(p => p.enabled).map((plan) => {
                    const discountPercent = plan.originalPriceUSD 
                      ? Math.round(((plan.originalPriceUSD - plan.priceUSD) / plan.originalPriceUSD) * 100)
                      : null;

                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-2xl p-4.5 sm:p-5 flex flex-col justify-between transition-all duration-300 ${
                          plan.isPopular
                            ? "bg-gradient-to-b from-[#18150c] via-[#120f09] to-[#0d0d0d] border-2 border-yellow-400 shadow-neon-yellow scale-[1.02] z-10"
                            : "bg-[#111111] border border-white/10 hover:border-yellow-400/40 hover:bg-[#141414]"
                        }`}
                      >
                        {/* Most Popular Badge */}
                        {plan.isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 text-black border border-yellow-300 shadow-md whitespace-nowrap">
                            ★ MOST POPULAR
                          </div>
                        )}

                        <div>
                          {/* Top Plan Badge */}
                          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                            {plan.durationDays} DAYS ACCESS
                          </div>

                          {/* Plan Name */}
                          <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                              {plan.name}
                            </h4>
                          </div>

                          {/* Tool Subtitle */}
                          <p className="text-[11px] text-slate-400 mb-3 font-medium truncate">
                            {tools[0]?.name || "Fast OTP Pro Utility"}
                          </p>

                          {/* Price Display */}
                          <div className="mb-2 pb-3 border-b border-white/10">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-yellow-400 leading-none">
                                ${plan.priceUSD}
                              </span>
                              <span className="text-xs font-bold text-white uppercase tracking-wider">
                                USD 🔥
                              </span>
                              {plan.originalPriceUSD && (
                                <span className="text-xs text-slate-500 line-through font-mono">
                                  ${plan.originalPriceUSD}
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] font-mono text-slate-300 mt-1">
                              bKash / Rocket Equivalent: <strong className="text-yellow-400">৳{plan.priceBDT} BDT</strong>
                            </div>

                            {discountPercent && (
                              <div className="mt-2">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600/25 text-red-400 border border-red-500/40">
                                  Save {discountPercent}% Offer Price
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Features List */}
                          <div className="space-y-1.5 mb-5 text-[11px] text-slate-300">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                              Included in this license:
                            </div>
                            {plan.features.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                                <span className="leading-tight">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CTA Button & Subtext */}
                        <div className="pt-2 border-t border-white/10 space-y-2 mt-auto">
                          <Link
                            href={`/checkout?tool=${plan.toolId}&plan=${plan.id}`}
                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all text-center shadow-lg ${
                              plan.isPopular
                                ? "bg-yellow-400 hover:bg-yellow-300 text-black shadow-neon-yellow"
                                : "bg-white/10 hover:bg-yellow-400 hover:text-black text-white border border-white/15"
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Select &amp; Buy Plan</span>
                          </Link>

                          <div className="text-[10px] text-center font-mono text-slate-400">
                            Auto Delivery via bKash / Rocket
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Payment Numbers & Wallet Link */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 font-mono">
                  <div className="flex flex-wrap items-center gap-4">
                    <span>
                      bKash: <strong className="text-yellow-400 select-all">{settings.bkashMerchantNumber}</strong>
                    </span>
                    <span>
                      Rocket: <strong className="text-red-400 select-all">{settings.rocketMerchantNumber}</strong>
                    </span>
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="text-xs font-bold text-yellow-400 hover:text-yellow-300 hover:underline flex items-center gap-1 font-sans"
                  >
                    <span>Or Buy instantly with Wallet Balance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* 3-Step Easy Purchase Guide */}
                <div className="mt-2 p-3.5 rounded-xl bg-black/60 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center shrink-0 text-[10px]">১</span>
                    <span><strong>প্ল্যান বেছে নিন</strong> ($২, $৪ বা $৮)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">২</span>
                    <span><strong>bKash / Rocket</strong>-এ Send Money করে TrxID দিন</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center shrink-0 text-[10px]">৩</span>
                    <span><strong>টুল ডাউনলোড</strong> ও লাইসেন্স কী সাথে সাথে পান!</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* If admin ever adds additional tools, show them cleanly underneath */}
        {tools.length > 1 && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.slice(1).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

      </section>

      {/* ============================================================== */}
      {/* SECTION 3: ANIMATED STATS SECTION                                */}
      {/* ============================================================== */}
      <StatsSection />

      {/* ============================================================== */}
      {/* SECTION 4: TELEGRAM VIP CTA                                     */}
      {/* ============================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-yellow-400 via-red-600 to-yellow-500 shadow-neon-yellow overflow-hidden">
          <div className="relative rounded-3xl bg-[#090909] px-6 py-10 sm:px-12 sm:py-12 text-center space-y-4">
            
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500 flex items-center justify-center mx-auto shadow-neon-red">
              <Send className="w-7 h-7 text-yellow-400" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Join Toolsbd.com Telegram Community
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Get immediate announcements on tool version updates, promotional discounts, exclusive configuration scripts, and 24/7 direct owner support.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={settings.telegramGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-red-600 to-red-700 hover:opacity-95 shadow-neon-red flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Join Official Telegram</span>
              </a>

              <Link
                href="/tools"
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs sm:text-sm font-black text-black bg-yellow-400 hover:bg-yellow-300 shadow-neon-yellow transition-all text-center"
              >
                <span>Explore Tools Marketplace</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
