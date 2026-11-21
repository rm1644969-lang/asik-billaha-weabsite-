"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Tool } from "@/lib/types";
import { 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  ExternalLink, 
  Sparkles,
  CheckCircle2,
  Lock,
  Clock
} from "lucide-react";
import { getToolTitleClass, getToolBadgeStyle } from "@/lib/toolStyles";
import Card3D from "@/components/Card3D";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const isComingSoon = tool.status === "coming_soon";
  const brandStyle = getToolBadgeStyle(tool.name);
  const toolTitleClass = getToolTitleClass(tool.name);

  const lowestPriceUSD = tool.plans && tool.plans.length > 0 
    ? Math.min(...tool.plans.map(p => p.priceUSD))
    : 2;
  const lowestPriceBDT = tool.plans && tool.plans.length > 0 
    ? Math.min(...tool.plans.map(p => p.priceBDT))
    : 240;

  return (
    <Card3D maxTilt={7} depth={1.03} glare={true} className="h-full">
      <div className={`group relative rounded-2xl p-[1px] transition-all duration-500 shadow-xl h-full preserve-3d ${
        isComingSoon 
          ? "bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/10 hover:border-yellow-400/40 hover:shadow-neon-yellow/30" 
          : "bg-gradient-to-b from-yellow-400/50 via-red-500/30 to-yellow-600/20 hover:from-yellow-400 hover:via-red-500 hover:to-yellow-400 hover:shadow-neon-yellow"
      }`}>
      
      {/* Background card with glass effect */}
      <div className="relative rounded-2xl bg-[#0c0c0c]/95 backdrop-blur-xl p-6 h-full flex flex-col justify-between overflow-hidden border border-white/10 preserve-3d">
        
        {/* Glow ambient circle on card hover */}
        {!isComingSoon && (
          <div className="absolute -top-24 -right-24 w-52 h-52 bg-yellow-500/20 rounded-full blur-3xl group-hover:bg-red-600/25 transition-colors pointer-events-none" />
        )}

        <div>
          {/* Header & Badges */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${brandStyle.badgeBg} ${brandStyle.badgeText} ${brandStyle.badgeBorder}`}>
              {tool.category || brandStyle.brandTag}
            </span>
            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isComingSoon 
                ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/40 shadow-sm" 
                : "text-white bg-red-950/80 border border-red-500/60 shadow-neon-red/50"
            }`}>
              {isComingSoon ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: "6s" }} />
                  <span>শীঘ্রই আসছে</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{tool.version}</span>
                </>
              )}
            </div>
          </div>

          {/* Banner Image / Thumbnail */}
          <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden mb-5 border border-white/10 group-hover:border-yellow-400/60 transition-all shadow-lg group-hover:shadow-neon-yellow/30">
            <Image
              src={tool.bannerUrl}
              alt={tool.name}
              fill
              className={`object-cover object-top transition-transform duration-700 ${isComingSoon ? "opacity-85" : "group-hover:scale-105"}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent opacity-80" />
            
            {/* Overlay if Coming Soon */}
            {isComingSoon && (
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center">
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/90 border border-yellow-400/70 text-yellow-400 text-xs font-black tracking-widest uppercase shadow-2xl">
                  <Lock className="w-4 h-4 text-yellow-400" />
                  <span>Coming Soon</span>
                </span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <span className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 font-semibold shadow-sm">
                <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                <span>{tool.systemRequirements.os}</span>
              </span>
              <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 text-yellow-400 font-mono text-[11px] font-bold shadow-sm">
                {tool.fileSize}
              </span>
            </div>
          </div>

          {/* Title with Distinctive Masked Gradient Colors */}
          <h3 className="text-xl sm:text-2xl font-black tracking-tight transition-transform duration-300">
            <span className={`${toolTitleClass} select-none`}>
              {tool.name}
            </span>
          </h3>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-4 border-t border-white/10 mt-auto">
          {isComingSoon ? (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-400 font-medium">রিলিজ স্ট্যাটাস</span>
                <span className="text-yellow-400 font-bold font-mono">সক্রিয় কাজ চলছে ⏳</span>
              </div>
              <div className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed select-none shadow-md ${brandStyle.badgeBg} ${brandStyle.badgeText} ${brandStyle.badgeBorder}`}>
                <Lock className="w-4 h-4" />
                <span>শীঘ্রই আসছে (Coming Soon)</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">অফার মূল্য শুরু মাত্র</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-yellow-400">
                      ${lowestPriceUSD}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">/ ৭ দিন</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (৳{lowestPriceBDT})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] text-white font-bold bg-red-950 px-2 py-1 rounded border border-red-500/50 shadow-sm">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span>বিকাশ &bull; রকেট</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all text-center hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>বিস্তারিত</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href={`/tools/${tool.slug}#plans`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 transition-all text-center"
                >
                  <span>লাইসেন্স নিন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
      </div>
    </Card3D>
  );
}
