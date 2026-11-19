"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Check,
  Download,
  Cpu,
  Lock,
  Smartphone
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
      {/* SECTION 2: OFFICIAL FLAGSHIP SOFTWARE SHOWCASE                 */}
      {/* ============================================================== */}
      <section id="official-tool" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        
        {/* Top Tag */}
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-400 mb-2">
          <Layers className="w-4 h-4 text-red-500" />
          <span>Flagship Release &bull; Official Software Tool</span>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Software Overview & Core Capabilities */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-white text-xs font-bold mb-3 shadow-neon-red">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>v3.0 PRO &bull; Windows 10 / 11 (64-bit)</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                FAST OTP &mdash; <br />
                <span className="bg-gradient-to-r from-yellow-400 via-white to-yellow-500 bg-clip-text text-transparent">
                  FB Auto Resender Pro
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed font-normal">
                High-speed automated OTP resender utility with instant HWID cryptographic license verification, multi-threaded high-concurrency engine, and zero-latency execution.
              </p>
            </div>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs">
                  <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Multi-Thread Concurrency</span>
                </div>
                <p className="text-[11px] text-slate-400">Blazing fast high-speed engine with zero latency.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <Lock className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Permanent HWID Lock</span>
                </div>
                <p className="text-[11px] text-slate-400">Cryptographically bound to your machine hardware.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant Auto Delivery</span>
                </div>
                <p className="text-[11px] text-slate-400">bKash &amp; Rocket SMS verified in under 45 seconds.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Clean &amp; Untampered</span>
                </div>
                <p className="text-[11px] text-slate-400">SHA-256 cryptographic integrity checksum verified.</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href="#offer-pricing"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-black text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:opacity-95 shadow-neon-yellow flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>অফার প্ল্যান দেখুন ($২ &mdash; $৮) &darr;</span>
              </a>

              <a
                href="/releases/Setup.zip"
                download
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black text-white bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-yellow-400" />
                <span>টুল ডাউনলোড (28.4 MB)</span>
              </a>
            </div>

          </div>

          {/* Right Column: Large High-Res Desktop Software Mockup */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-yellow-400 via-red-500/40 to-white/10 shadow-2xl">
              <div className="rounded-3xl bg-[#090909] overflow-hidden border border-white/10 shadow-neon-yellow">
                
                {/* Desktop Window Titlebar */}
                <div className="px-4 py-3 bg-[#111111] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-slate-300 font-bold ml-2">
                      FAST OTP &mdash; FB Auto Resender Pro Login
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    STATUS: ACTIVE
                  </span>
                </div>

                {/* Software Preview Image */}
                <div className="relative w-full aspect-[16/10] bg-black">
                  <Image
                    src="/images/fast-otp-tool.jpg"
                    alt="FAST OTP — FB Auto Resender Pro Software Interface"
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Bottom Spec Footer */}
                <div className="px-5 py-3 bg-[#0d0d0d] border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>File Size: <strong className="text-yellow-400">28.4 MB</strong></span>
                  <span>Architecture: <strong className="text-white">x64 (.NET 8.0)</strong></span>
                  <span className="text-emerald-400 font-bold">100% Virus-Free</span>
                </div>

              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ============================================================== */}
      {/* SECTION 3: TOOLS OFFER PRICE (SPACIOUS 3-CARD FULL WIDTH GRID)  */}
      {/* ============================================================== */}
      <section id="offer-pricing" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-20">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-500 text-yellow-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Limited Time Promotional Pricing &bull; Instant bKash &bull; Rocket Delivery</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
            <span>TOOLS OFFER PRICE</span>
            <span className="text-3xl sm:text-4xl">📢</span>
          </h2>
          
          <p className="text-sm sm:text-base font-bold text-yellow-400">
            7 DAYS &mdash; $2 🔥 &nbsp;|&nbsp; 15 DAYS &mdash; $4 🔥 &nbsp;|&nbsp; 30 DAYS &mdash; $8 🔥
          </p>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Choose your subscription plan below and receive your tool setup file and permanent HWID license key immediately.
          </p>
        </div>

        {/* 3 Spacious Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.filter(p => p.enabled).map((plan) => {
            const discountPercent = plan.originalPriceUSD 
              ? Math.round(((plan.originalPriceUSD - plan.priceUSD) / plan.originalPriceUSD) * 100)
              : null;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  plan.isPopular
                    ? "bg-gradient-to-b from-[#18140c] via-[#120f09] to-[#0c0c0c] border-2 border-yellow-400 shadow-neon-yellow md:-translate-y-2 z-10"
                    : "bg-[#0d0d0d] border border-white/10 hover:border-yellow-400/40 hover:bg-[#111111] shadow-xl"
                }`}
              >
                {/* Most Popular Floating Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 text-black border border-yellow-300 shadow-lg whitespace-nowrap">
                    ★ MOST POPULAR
                  </div>
                )}

                <div>
                  {/* Duration Badge */}
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    {plan.durationDays} DAYS ACCESS
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1">
                    {plan.name}
                  </h3>
                  
                  <p className="text-xs text-slate-400 mb-4 font-medium">
                    FAST OTP &mdash; FB Auto Resender Pro
                  </p>

                  {/* Price Block */}
                  <div className="pb-5 mb-5 border-b border-white/10 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-yellow-400 leading-none">
                        ${plan.priceUSD}
                      </span>
                      <span className="text-sm font-bold text-white uppercase tracking-wider">
                        USD 🔥
                      </span>
                      {plan.originalPriceUSD && (
                        <span className="text-sm text-slate-500 line-through font-mono">
                          ${plan.originalPriceUSD}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono text-slate-300">
                      bKash / Rocket Equivalent: <strong className="text-yellow-400 font-bold">৳{plan.priceBDT} BDT</strong>
                    </div>

                    {discountPercent && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600/25 text-red-400 border border-red-500/40">
                        Save {discountPercent}% Offer Price
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 mb-6 text-xs text-slate-200">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      INCLUDED IN THIS LICENSE:
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Big Action Button */}
                <div className="pt-4 border-t border-white/10 space-y-2.5 mt-auto">
                  <Link
                    href={`/checkout?tool=${plan.toolId}&plan=${plan.id}`}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all text-center shadow-lg ${
                      plan.isPopular
                        ? "bg-yellow-400 hover:bg-yellow-300 text-black shadow-neon-yellow"
                        : "bg-white/10 hover:bg-yellow-400 hover:text-black text-white border border-white/15"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Select &amp; Buy Plan</span>
                  </Link>

                  <div className="text-[11px] text-center font-mono text-slate-400">
                    Auto Delivery via bKash / Rocket
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Minimalist Payment Bar */}
        <div className="mt-10 p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-300">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
            <span>
              bKash Personal: <strong className="text-yellow-400 font-bold select-all">{settings.bkashMerchantNumber}</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span>
              Rocket Personal: <strong className="text-red-400 font-bold select-all">{settings.rocketMerchantNumber}</strong>
            </span>
          </div>

          <Link
            href="/dashboard"
            className="text-yellow-400 hover:text-yellow-300 hover:underline font-sans font-bold flex items-center gap-1.5"
          >
            <span>Or Buy instantly with Wallet Balance</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

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
