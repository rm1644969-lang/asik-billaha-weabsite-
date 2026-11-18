"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useNexusStore } from "@/lib/store";
import { normalizeYouTubeEmbedUrl } from "@/lib/youtube";
import PricingCard from "@/components/PricingCard";
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
  MonitorCheck
} from "lucide-react";

export default function ToolDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { tools, plans } = useNexusStore();

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

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-purple-300 font-semibold">{tool.name}</span>
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
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600/90 text-white backdrop-blur-md shadow-md">
                {tool.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                {tool.version}
              </span>
            </div>
          </div>

          {/* Screenshots Thumbnails */}
          {tool.screenshots && tool.screenshots.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Application Screenshots
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {tool.screenshots.map((shot, idx) => (
                  <div 
                    key={idx}
                    className="relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors"
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
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {tool.name}
            </h1>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              {tool.tagline}
            </p>
          </div>

          {/* Meta specs bar */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-surface-card border border-white/5 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400">Supported OS</span>
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>{tool.systemRequirements.os}</span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400">Package Size</span>
              <p className="font-semibold text-white flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>{tool.fileSize}</span>
              </p>
            </div>
          </div>

          {/* Key Highlights */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Capabilities:
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {tool.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Jump to pricing button */}
          <div className="pt-2">
            <a
              href="#plans"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-neon-purple transition-all"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Choose a License Plan & Buy Now</span>
            </a>
            <p className="text-center text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Automated bKash & Nagad instant delivery</span>
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
                ? "bg-purple-600 text-white shadow-neon-purple"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Full Description
          </button>
          <button
            onClick={() => setActiveTab("setup")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "setup"
                ? "bg-purple-600 text-white shadow-neon-purple"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Setup Guide & Video
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "specs"
                ? "bg-purple-600 text-white shadow-neon-purple"
                : "text-slate-400 hover:text-white"
            }`}
          >
            System Requirements
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-white/5">
            <h3 className="text-xl font-bold text-white">About {tool.name}</h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
              {tool.description}
            </p>
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="font-semibold text-slate-200 block mb-1">Package Checksum (SHA-256):</span>
                <span className="font-mono text-[11px] text-cyan-300 break-all">{tool.checksumSha256}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="font-semibold text-slate-200 block mb-1">Delivery Mechanism:</span>
                <span className="text-slate-300">Instant digital dashboard download + HWID license token</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Setup Video */}
        {activeTab === "setup" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-white/10">
            <h3 className="text-xl font-black text-white">Video Installation Guide</h3>
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
              <p className="font-bold text-white text-sm">Installation Steps:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                <li>Download the authorized release zip from your dashboard.</li>
                <li>Extract files to a dedicated directory (e.g., C:\NexusTools\{tool.slug}).</li>
                <li>Launch the application as Administrator.</li>
                <li>Copy the displayed HWID or paste your active license key to bind.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 3: System Requirements */}
        {activeTab === "specs" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-white/5">
            <h3 className="text-xl font-bold text-white">Hardware & Environment Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                <span className="text-slate-400 block mb-1">Operating System</span>
                <span className="font-bold text-white text-sm">{tool.systemRequirements.os}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                <span className="text-slate-400 block mb-1">System Memory</span>
                <span className="font-bold text-white text-sm">{tool.systemRequirements.ram}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                <span className="text-slate-400 block mb-1">Processor</span>
                <span className="font-bold text-white text-sm">{tool.systemRequirements.processor}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-card border border-white/5">
                <span className="text-slate-400 block mb-1">Dependencies</span>
                <span className="font-bold text-white text-sm">{tool.systemRequirements.netFramework}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Available Plans Section */}
      <section id="plans" className="pt-12 space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
            Special Limited Offer
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            TOOLS OFFER PRICE 🔊
          </h2>
          <p className="text-slate-300 text-sm font-semibold">
            7 DAYS — <span className="text-yellow-400 font-black">$2 🔥</span> &bull; 15 DAYS — <span className="text-yellow-400 font-black">$4 🔥</span> &bull; 30 DAYS — <span className="text-yellow-400 font-black">$8 🔥</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {toolPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} toolSlug={tool.slug} />
          ))}
        </div>
      </section>

    </div>
  );
}
