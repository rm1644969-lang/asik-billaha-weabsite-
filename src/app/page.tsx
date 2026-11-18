"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Hero3D from "@/components/Hero3D";
import ToolCard from "@/components/ToolCard";
import PricingCard from "@/components/PricingCard";
import StatsSection from "@/components/StatsSection";
import { useNexusStore } from "@/lib/store";
import { normalizeYouTubeEmbedUrl } from "@/lib/youtube";
import { 
  Send, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Download, 
  CheckCircle2, 
  ChevronDown, 
  Play, 
  Star, 
  Terminal, 
  Cpu, 
  Smartphone,
  Sparkles,
  Lock,
  Layers,
  Activity
} from "lucide-react";

export default function HomePage() {
  const { tools, plans, settings, reviews, tutorials, faqs } = useNexusStore();
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

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
          
          {/* Hero Copy (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
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
                <span>bKash (01967922602) & Rocket (01731328169)</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                <span>1-Click HWID Lock & Reset</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Activity className="w-4 h-4 text-white" />
                <span>10k-12k Daily Traffic Scale</span>
              </span>
            </div>

          </div>

          {/* Interactive Floating Card / Live Tool Showcase (Right 5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl p-[1px] bg-gradient-to-b from-yellow-400 via-red-500 to-transparent shadow-2xl backdrop-blur-2xl">
              
              {/* Card Container */}
              <div className="rounded-3xl bg-[#0e0e0e]/95 p-6 space-y-5 border border-white/10">
                
                {/* Header preview bar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-red-600" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-white/60" />
                    <span className="text-xs font-mono text-white font-bold ml-2">toolsbd-guard.exe</span>
                  </div>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400 border border-yellow-400/40">
                    STATUS: SECURE
                  </span>
                </div>

                {/* Software Live Simulation */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-lg bg-black/80 border border-white/10 space-y-1.5">
                    <div className="text-slate-300 flex items-center justify-between">
                      <span>MACHINE HWID:</span>
                      <span className="text-yellow-400 font-bold">BFEBFBFF-000906EA-F48E</span>
                    </div>
                    <div className="text-slate-300 flex items-center justify-between">
                      <span>LICENSE KEY:</span>
                      <span className="text-white font-bold">TBD-OTP-30D-88AF-901B</span>
                    </div>
                    <div className="text-slate-300 flex items-center justify-between">
                      <span>VALIDITY:</span>
                      <span className="text-red-500 font-bold">ACTIVE (28 DAYS REMAINING)</span>
                    </div>
                  </div>

                  {/* Terminal simulation log stream */}
                  <div className="p-3.5 rounded-lg bg-black/90 border border-white/10 text-[11px] space-y-1 text-slate-300">
                    <p className="text-yellow-400">[TOOLSBD] Connecting to Bangladesh Cloud Gateway...</p>
                    <p className="text-white">[PAYMENT] bKash TrxID BK992A81KC matched in 32s</p>
                    <p className="text-red-400">[LICENSE] Cryptographic RSA token generated OK</p>
                    <p className="text-slate-400">[SYSTEM] HWID locked to client hardware.</p>
                  </div>
                </div>

                {/* Quick Action Button inside preview */}
                <Link
                  href="/tools/otp-testing-utility"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-black flex items-center justify-center gap-2 hover:opacity-95 shadow-neon-yellow transition-all"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Inspect Featured Utility (OTP Testing)</span>
                </Link>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: ANIMATED STATS SECTION                                */}
      {/* ============================================================== */}
      <StatsSection />

      {/* ============================================================== */}
      {/* SECTION 3: FLAGSHIP TOOL & TOOLS OFFER PRICE                    */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
        
        {/* Flagship Tool Showcase */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-400 mb-2">
                <Layers className="w-4 h-4 text-red-500" />
                <span>Flagship Release</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Our Official Software Tool
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

          {/* Responsive Grid: Centered flagship card if 1 tool, multi-col grid if more added from admin */}
          <div className={tools.length === 1 ? "max-w-lg mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>

        {/* TOOLS OFFER PRICE SECTION */}
        <div id="offer-prices" className="scroll-mt-24 space-y-10 pt-8 border-t border-white/10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500 text-yellow-400 text-xs font-black uppercase tracking-widest shadow-neon-red">
              <span>🔊 LIMITED TIME SPECIAL</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              TOOLS OFFER PRICE 🔊
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-semibold">
              7 DAYS — <span className="text-yellow-400 font-black">$2 🔥</span> &nbsp;|&nbsp; 15 DAYS — <span className="text-yellow-400 font-black">$4 🔥</span> &nbsp;|&nbsp; 30 DAYS — <span className="text-yellow-400 font-black">$8 🔥</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.filter(p => p.enabled).map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>

      </section>

      {/* ============================================================== */}
      {/* SECTION 4: PLATFORM CORE ARCHITECTURE & CAPABILITIES             */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#090909]/90 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-red-500">
              Zero Latency Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Built for Scale, Security & Instant Delivery
            </h2>
            <p className="text-slate-300 text-sm">
              We eliminated manual wait times. Everything from bKash / Rocket verification to HWID locking is handled automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="relative rounded-2xl p-7 bg-[#0e0e0e] border border-white/10 hover:border-yellow-400 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-yellow-950/60 border border-yellow-500/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                Automated Companion SMS Gateway
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Our companion Android app monitors incoming merchant SMS notifications from bKash (01967922602) and Rocket (01731328169), matching TrxIDs within 45 seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative rounded-2xl p-7 bg-[#0e0e0e] border border-white/10 hover:border-red-500 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                Hardware ID (HWID) Cryptography
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Licenses are cryptographically tied to the user&apos;s machine hardware fingerprint. Switch PCs? Use your 1-click HWID reset inside your dashboard.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative rounded-2xl p-7 bg-[#0e0e0e] border border-white/10 hover:border-white transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                Protected Direct Cloud Mirrors
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                High-speed authorized downloads with cryptographic SHA-256 integrity checksums to guarantee clean, uncorrupted, and untampered software files.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 5: VIDEO SETUP TUTORIALS & GUIDES                        */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
            Installation & Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Watch Step-by-Step Video Guides
          </h2>
          <p className="text-slate-300 text-sm">
            Learn how to extract, run as administrator, acquire your machine HWID, and verify your license key.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tutorials.map((tut) => (
            <div 
              key={tut.id}
              className="rounded-2xl p-6 bg-[#0e0e0e] border border-white/10 hover:border-yellow-400/50 transition-all space-y-4"
            >
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 group">
                <iframe
                  width="560"
                  height="315"
                  src={normalizeYouTubeEmbedUrl(tut.videoUrl)}
                  title={tut.title}
                  className="w-full h-full pointer-events-auto"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-yellow-400 font-bold mb-1">
                  <span>{tut.toolName}</span>
                  <span className="text-slate-400">{tut.duration}</span>
                </div>
                <h3 className="text-lg font-black text-white mb-2">
                  {tut.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {tut.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-200">
                  <p className="font-bold text-white text-sm">Execution Steps:</p>
                  {tut.steps.map((st, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 6: CUSTOMER REVIEWS & FEEDBACK                           */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#090909]/80 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-red-500">
              Community Satisfaction
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Trusted by Hundreds of Power Users
            </h2>
            <p className="text-slate-300 text-sm">
              Read real feedback from verified customers in our Toolsbd.com community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl p-6 bg-[#0e0e0e] border border-white/10 hover:border-yellow-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-yellow-400 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-200 italic leading-relaxed mb-6 font-normal">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center text-xs font-black">
                      {rev.customerName[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {rev.customerName}
                      </h4>
                      <p className="text-[10px] text-yellow-400 font-semibold">
                        {rev.toolName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 7: FREQUENTLY ASKED QUESTIONS                           */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-300 text-sm">
            Everything you need to know about purchasing, auto-verification and HWID licensing on Toolsbd.com.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-[#0e0e0e] border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <span className="text-base font-bold text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-yellow-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-300 leading-relaxed border-t border-white/10 font-normal">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 8: TELEGRAM VIP CTA                                     */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
