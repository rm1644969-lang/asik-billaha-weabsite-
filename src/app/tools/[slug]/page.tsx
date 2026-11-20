"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useNexusStore } from "@/lib/store";
import { normalizeYouTubeEmbedUrl } from "@/lib/youtube";
import PricingCard from "@/components/PricingCard";
import Card3D from "@/components/Card3D";
import CyberCanvas3D from "@/components/CyberCanvas3D";
import { 
  Cpu, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  ChevronRight, 
  FileCheck, 
  Sparkles,
  Zap,
  HardDrive,
  MonitorCheck,
  Lock
} from "lucide-react";
import { getToolTitleClass } from "@/lib/toolStyles";

export default function ToolDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { tools, plans, settings } = useNexusStore();

  const tool = tools.find((t) => t.slug === slug) || tools[0];
  const toolPlans = plans.filter((p) => p.toolId === tool.id && p.enabled);

  const [activeTab, setActiveTab] = useState<"overview" | "setup" | "specs">("overview");

  if (!tool) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-white">Tool Not Found</h2>
        <p className="text-slate-400 text-sm">The requested utility does not exist.</p>
        <Link href="/tools" className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold">
          Back to Tools
        </Link>
      </div>
    );
  }

  if (tool.status === "coming_soon") {
    return (
      <div className="py-24 text-center max-w-lg mx-auto space-y-5 px-4 relative overflow-hidden">
        <CyberCanvas3D className="absolute inset-0 pointer-events-none opacity-40 z-0" />
        <div className="relative z-10 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/40 text-yellow-400 flex items-center justify-center mx-auto shadow-neon-yellow">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white">{tool.name}</h2>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-400 text-black">
            শীঘ্রই আসছে (COMING SOON)
          </span>
          <p className="text-slate-300 text-sm leading-relaxed">
            এই স্বয়ংক্রিয় সফটওয়্যারটি বর্তমানে সক্রিয় ডেভেলপমেন্টে রয়েছে। খুব শীঘ্রই এটি ক্রয় ও সরাসরি ডাউনলোডের জন্য উন্মুক্ত করা হবে।
          </p>
          <div className="pt-2">
            <Link href="/tools" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-neon-yellow transition-all">
              <span>অন্যান্য টুলগুলো দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 overflow-hidden">
      
      {/* 3D Ambient Cyber Canvas */}
      <CyberCanvas3D className="absolute -top-10 left-0 right-0 h-[500px] pointer-events-none opacity-40 z-0" />

      <div className="relative z-10 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">হোম</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/tools" className="hover:text-white transition-colors">টুলস</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-yellow-400 font-bold">{tool.name}</span>
        </nav>

        {/* Hero Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Banner & Video */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={tool.bannerUrl}
                alt={tool.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050716] via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-400 text-black shadow-neon-yellow">
                  {tool.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950/80 text-white border border-red-500/50 backdrop-blur-md">
                  {tool.version}
                </span>
              </div>
            </div>

            {/* Screenshots Thumbnails */}
            {tool.screenshots && tool.screenshots.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  সফটওয়্যার স্ক্রিনশটসমূহ
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {tool.screenshots.map((shot, idx) => (
                    <div 
                      key={idx}
                      className="relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-yellow-400/50 transition-colors"
                    >
                      <Image
                        src={shot}
                        alt={`${tool.name} screenshot ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Title, Quick Specs & Instant CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${getToolTitleClass(tool.name)}`}>
                {tool.name}
              </h1>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                {tool.tagline}
              </p>
            </div>

            {/* Meta specs bar */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0f0f0f] border border-white/10 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">সমর্থিত অপারেটিং সিস্টেম</span>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{tool.systemRequirements.os}</span>
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">প্যাকেজ সাইজ</span>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-red-400" />
                  <span>{tool.fileSize}</span>
                </p>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                মূল সুবিধাসমূহ:
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {tool.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Jump to pricing button */}
            <div className="pt-2">
              <a
                href="#plans"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:opacity-95 text-black font-black text-sm flex items-center justify-center gap-2 shadow-neon-yellow transition-all"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>লাইসেন্স প্ল্যান বেছে নিন ও কিনুন</span>
              </a>
              <p className="text-center text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>বিকাশ ও রকেটে দ্রুত স্বয়ংক্রিয় লাইসেন্স ডেলিভারি</span>
              </p>
            </div>

          </div>

        </div>

        {/* Tabbed Content: Overview / Setup Video / Technical Specs */}
        <div className="space-y-6 pt-8">
          
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-yellow-400 text-black shadow-neon-yellow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              সম্পূর্ণ বিবরণ
            </button>
            <button
              onClick={() => setActiveTab("setup")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "setup"
                  ? "bg-yellow-400 text-black shadow-neon-yellow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              সেটআপ গাইড ও ভিডিও
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "specs"
                  ? "bg-yellow-400 text-black shadow-neon-yellow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              সিস্টেম রিকোয়ারমেন্ট
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <Card3D maxTilt={4} depth={1.01} glare={true}>
              <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-white/5">
                <h3 className="text-xl font-bold text-white text-gradient-shimmer">{tool.name} সম্পর্কে বিস্তারিত</h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                  {tool.description}
                </p>
                <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="font-semibold text-slate-200 block mb-1">প্যাকেজ চেকসাম (SHA-256):</span>
                    <span className="font-mono text-[11px] text-cyan-300 break-all">{tool.checksumSha256}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="font-semibold text-slate-200 block mb-1">ডেলিভারি পদ্ধতি:</span>
                    <span className="text-slate-300">তাৎক্ষণিক ড্যাশবোর্ড ডাউনলোড + স্বয়ংক্রিয় HWID লাইসেন্স কি</span>
                  </div>
                </div>
              </div>
            </Card3D>
          )}

          {/* Tab 2: Setup Video */}
          {activeTab === "setup" && (
            <Card3D maxTilt={4} depth={1.01} glare={true}>
              <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-white/10">
                <h3 className="text-xl font-black text-white text-gradient-shimmer">ভিডিও ইনস্টলেশন ও সেটআপ গাইড</h3>
                <div className="relative aspect-video max-w-3xl rounded-2xl overflow-hidden border border-yellow-400/30 shadow-xl">
                  <iframe
                    width="560"
                    height="315"
                    src={normalizeYouTubeEmbedUrl(tool.setupVideoUrl)}
                    title={`${tool.name} setup guide`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-white text-sm">ইনস্টলেশন নির্দেশিকা:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>আপনার ড্যাশবোর্ড থেকে অফিশিয়াল সফটওয়্যার জিপ ফাইলটি ডাউনলোড করুন।</li>
                    <li>ফাইলটি যেকোনো একটি ফোল্ডারে এক্সট্রাক্ট (আনজিপ) করুন।</li>
                    <li>সফটওয়্যারটিতে রাইট-ক্লিক করে &apos;Run as administrator&apos; দিয়ে ওপেন করুন।</li>
                    <li>সফটওয়্যারের HWID কপি করে আপনার ড্যাশবোর্ডে দিন অথবা প্রাপ্ত লাইসেন্স কী পেস্ট করে অ্যাক্টিভ করুন।</li>
                  </ol>
                </div>
              </div>
            </Card3D>
          )}

          {/* Tab 3: System Requirements */}
          {activeTab === "specs" && (
            <Card3D maxTilt={4} depth={1.01} glare={true}>
              <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-white/5">
                <h3 className="text-xl font-bold text-white text-gradient-shimmer">হার্ডওয়্যার ও টেকনিক্যাল স্পেসিফিকেশন</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <span className="text-slate-400 block mb-1">অপারেটিং সিস্টেম</span>
                    <span className="font-bold text-white text-sm">{tool.systemRequirements.os}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <span className="text-slate-400 block mb-1">সিস্টেম মেমোরি (RAM)</span>
                    <span className="font-bold text-white text-sm">{tool.systemRequirements.ram}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <span className="text-slate-400 block mb-1">প্রসেসর</span>
                    <span className="font-bold text-white text-sm">{tool.systemRequirements.processor}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                    <span className="text-slate-400 block mb-1">প্রয়োজনীয় সফটওয়্যার</span>
                    <span className="font-bold text-white text-sm">{tool.systemRequirements.netFramework}</span>
                  </div>
                </div>
              </div>
            </Card3D>
          )}

        </div>

        {/* Available Plans Section */}
        <section id="plans" className="pt-12 space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
              স্পেশাল সীমিত সময়ের অফার
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gradient-shimmer">
              টুলস স্পেশাল অফার প্রাইস 🔊
            </h2>
            <p className="text-slate-300 text-sm font-semibold">
              ৭ দিন — <span className="text-yellow-400 font-black">$২ 🔥</span> &bull; ১৫ দিন — <span className="text-yellow-400 font-black">$৪ 🔥</span> &bull; ৩০ দিন — <span className="text-yellow-400 font-black">$৮ 🔥</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {toolPlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} toolSlug={tool.slug} />
            ))}
          </div>

          {/* Minimalist Payment Bar */}
          <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-300">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <span>
                বিকাশ: <strong className="text-yellow-400 font-bold select-all">{settings.bkashMerchantNumber}</strong>
              </span>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <span>
                নগদ: <strong className="text-orange-400 font-bold select-all">{settings.nagadMerchantNumber || "01609166109"}</strong>
              </span>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <span>
                রকেট: <strong className="text-red-400 font-bold select-all">{settings.rocketMerchantNumber}</strong>
              </span>
            </div>

            <Link
              href="/dashboard"
              className="text-yellow-400 hover:text-yellow-300 hover:underline font-sans font-bold flex items-center gap-1.5"
            >
              <span>অথবা ওয়ালেট দিয়ে তাৎক্ষণিক কিনুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
