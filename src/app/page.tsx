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
      {/* SECTION 1: 3D HERO SECTION                                      */}
      {/* ============================================================== */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-hero-gradient">
        
        {/* 3D WebGL Canvas Layer (Yellow, White, Black, Red) */}
        <Hero3D />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Copy (Left 8 Cols — Right side stays clean for 3D WebGL scene) */}
          <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-yellow-400/40 backdrop-blur-md shadow-neon-yellow">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-black text-yellow-300 uppercase tracking-wider">
                Toolsbd.com Official Platform
              </span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-red-600 text-white">
                AUTO 24/7
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Professional Software Tools &{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-white to-red-500 bg-clip-text text-transparent">
                Automated Licensing
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-normal">
              {settings.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/tools"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-black text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:opacity-95 shadow-neon-yellow flex items-center justify-center gap-2 group transition-all"
              >
                <span>Browse All Tools</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href={settings.telegramGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-black text-white bg-red-950/80 hover:bg-red-900 border border-red-500 hover:border-red-400 flex items-center justify-center gap-2 transition-all shadow-neon-red"
              >
                <Send className="w-4 h-4 text-red-400" />
                <span>Join Official Telegram</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-300 border-t border-white/10">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                <span>bKash (01967922602) &amp; Rocket (01731328169)</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                <span>1-Click HWID Lock &amp; Reset</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Activity className="w-4 h-4 text-white" />
                <span>10k-12k Daily Traffic Scale</span>
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: ANIMATED STATS SECTION                                */}
      {/* ============================================================== */}
      <StatsSection />

      {/* ============================================================== */}
      {/* SECTION 3: TOOL ON LEFT + PRICE LIST ON RIGHT (SIDE BY SIDE)    */}
      {/* ============================================================== */}
      <section id="offer-prices" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-400 mb-2">
              <Layers className="w-4 h-4 text-red-500" />
              <span>Flagship Release</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Our Official Software Tool &amp; Offer Price List
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              Independently tested, HWID protected, and delivered instantaneously upon bKash (01967922602) or Rocket (01731328169) confirmation.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-black text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <span>Full Specifications</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Side-by-Side Grid: Tool Card (Left) + Price List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Official Tool Card */}
          <div className="lg:col-span-5 flex flex-col">
            {tools[0] && <ToolCard tool={tools[0]} />}
          </div>

          {/* RIGHT: TOOLS OFFER PRICE List Panel */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-yellow-400 via-red-500/70 to-yellow-600/40 shadow-neon-yellow h-full">
              <div className="rounded-2xl bg-[#0b0b0b]/95 backdrop-blur-xl p-6 sm:p-7 h-full flex flex-col justify-between space-y-6 border border-white/10">
                
                {/* Price List Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-2">
                      <Sparkles className="w-3 h-3" />
                      <span>Limited Time Offer</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      TOOLS OFFER PRICE 🔊
                    </h3>
                  </div>
                  <div className="text-left sm:text-right text-xs font-mono text-slate-300">
                    <span className="block text-yellow-400 font-black">Instant HWID Key</span>
                    <span>bKash &bull; Rocket Auto</span>
                  </div>
                </div>

                {/* Offer Rows */}
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  {plans.filter(p => p.enabled).map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        plan.isPopular
                          ? "bg-gradient-to-r from-yellow-400/15 via-red-600/10 to-black border-yellow-400 shadow-neon-yellow"
                          : "bg-[#121212] border-white/10 hover:border-yellow-400/50"
                      }`}
                    >
                      {plan.isPopular && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white border border-yellow-400 shadow-md">
                          ★ Most Popular
                        </span>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg font-black text-white">
                            {plan.durationDays} DAYS OFFER 🔥
                          </span>
                          {plan.originalPriceUSD && (
                            <span className="text-xs text-slate-500 line-through font-mono">
                              ${plan.originalPriceUSD}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
                          {plan.features.slice(0, 3).map((feat, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-yellow-400 shrink-0" />
                              <span>{feat}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <div className="text-left sm:text-right">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-yellow-400 leading-none">
                              ${plan.priceUSD}
                            </span>
                            <span className="text-xs font-black text-white">🔥</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                            ৳{plan.priceBDT} BDT
                          </span>
                        </div>

                        <Link
                          href={`/checkout?tool=${plan.toolId}&plan=${plan.id}`}
                          className={`px-4 py-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 ${
                            plan.isPopular
                              ? "bg-yellow-400 hover:bg-yellow-300 text-black shadow-neon-yellow"
                              : "bg-red-600 hover:bg-red-500 text-white shadow-neon-red"
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Buy Now</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Payment Numbers Bar */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 font-mono">
                  <span>
                    bKash: <strong className="text-yellow-400">{settings.bkashMerchantNumber}</strong>
                  </span>
                  <span>
                    Rocket: <strong className="text-red-400">{settings.rocketMerchantNumber}</strong>
                  </span>
                  <Link href="/dashboard" className="text-yellow-400 hover:underline font-sans font-bold">
                    Or Buy with Wallet &rarr;
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* If admin ever adds additional tools, show them cleanly underneath */}
        {tools.length > 1 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.slice(1).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

      </section>

      {/* ============================================================== */}
      {/* SECTION 4: TELEGRAM VIP CTA                                     */}
      {/* ============================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-yellow-400 via-red-600 to-yellow-500 shadow-neon-yellow overflow-hidden">
          <div className="relative rounded-3xl bg-[#090909] px-6 py-14 sm:px-12 sm:py-16 text-center space-y-6">
            
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500 flex items-center justify-center mx-auto shadow-neon-red">
              <Send className="w-8 h-8 text-yellow-400" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Join Toolsbd.com Telegram Community
            </h2>
            <p className="text-base text-slate-300 max-w-xl mx-auto">
              Get immediate announcements on tool version updates, promotional discounts, exclusive configuration scripts, and 24/7 direct owner support.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href={settings.telegramGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-black text-white bg-gradient-to-r from-red-600 to-red-700 hover:opacity-95 shadow-neon-red flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-5 h-5" />
                <span>Join Official Telegram</span>
              </a>

              <Link
                href="/tools"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-black text-black bg-yellow-400 hover:bg-yellow-300 shadow-neon-yellow transition-all text-center"
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
