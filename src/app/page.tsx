"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Hero3D from "@/components/Hero3D";
import ToolCard from "@/components/ToolCard";
import StatsSection from "@/components/StatsSection";
import Card3D from "@/components/Card3D";
import CyberCanvas3D from "@/components/CyberCanvas3D";
import { useNexusStore } from "@/lib/store";
import { sampleTools } from "@/lib/mockData";
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
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-gradient-shimmer">
              প্রফেশনাল সফটওয়্যার টুলস ও স্বয়ংক্রিয় লাইসেন্সিং
            </h1>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link
                href="/tools"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-black bg-yellow-400 hover:bg-yellow-300 flex items-center justify-center gap-2 group transition-all"
              >
                <span>সবগুলো টুল দেখুন</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href={settings.telegramGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4 text-white" />
                <span>টেলিগ্রামে যুক্ত হোন</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[11px] sm:text-xs text-slate-300 border-t border-white/10">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                <span>বিকাশ, নগদ ও রকেট ইন্সট্যান্ট অটো ডেলিভারি</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                <span>সিঙ্গেল পিসি HWID সিকিউরিটি লক</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>২৪/৭ সক্রিয় টেলিগ্রাম সাপোর্ট</span>
              </span>
            </div>

          </div>

          {/* Right 5 Cols: Visual placeholder for 3D Cyber Eye (interactively tracks mouse) */}
          <div className="hidden lg:block lg:col-span-5 h-[360px] pointer-events-none" />

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: OUR OFFICIAL SOFTWARE TOOLS                          */}
      {/* ============================================================== */}
      <section id="official-tools" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 overflow-hidden">
        
        {/* 3D Ambient Cyber Canvas Background */}
        <CyberCanvas3D className="absolute top-0 left-0 right-0 h-[450px] pointer-events-none opacity-40 z-0" />

        <div className="relative z-10 space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-400 mb-1.5">
              <Layers className="w-4 h-4 text-red-500" />
              <span>অফিসিয়াল সফটওয়্যার টুলস রিলিজ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gradient-shimmer">
              আমাদের অফিসিয়াল সফটওয়্যার টুলস
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              টুলের উপর ক্লিক করে ভেতরে ঢুকলেই সম্পূর্ণ বিবরণ, অফার প্রাইস ($২, $৪, $৮) ও লাইসেন্স পেয়ে যাবেন।
            </p>
          </div>

          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <span>সবগুলো টুল দেখুন ({Math.max(tools.length, 3)})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tools Grid (Flagship + Coming Soon Tools side by side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {(tools && tools.length >= 3 ? tools : sampleTools).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: ANIMATED STATS SECTION                                */}
      {/* ============================================================== */}
      <StatsSection />

      {/* ============================================================== */}
      {/* SECTION 4: TELEGRAM COMMUNITY CTA                               */}
      {/* ============================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-[#0f1219] p-8 sm:p-12 text-center space-y-4">
          
          <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto text-yellow-400">
            <Send className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Toolsbd অফিসিয়াল টেলিগ্রাম কমিউনিটি
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            সরাসরি সফটওয়্যার আপডেট, নতুন ভার্সন রিলিজ, সেটআপ সহায়তা এবং ২৪/৭ লাইভ সাপোর্টের জন্য আমাদের অফিশিয়াল গ্রুপে যুক্ত হোন।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={settings.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-black bg-yellow-400 hover:bg-yellow-300 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>টেলিগ্রামে জয়েন করুন</span>
            </a>

            <Link
              href="/tools"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-center"
            >
              <span>টুলস মার্কেটপ্লেস</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
