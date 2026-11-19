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
    <div className={`group relative rounded-2xl p-[1px] transition-all duration-500 shadow-xl ${
      isComingSoon 
        ? "bg-gradient-to-b from-white/10 via-yellow-500/10 to-transparent border border-white/5" 
        : "bg-gradient-to-b from-white/20 via-yellow-500/20 to-red-600/30 hover:from-yellow-400 hover:via-red-500 hover:to-transparent hover:shadow-neon-yellow"
    }`}>
      
      {/* Background card with glass effect */}
      <div className="relative rounded-2xl bg-[#0c0c0c]/95 backdrop-blur-xl p-6 h-full flex flex-col justify-between overflow-hidden border border-white/10">
        
        {/* Glow ambient circle on card hover */}
        {!isComingSoon && (
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl group-hover:bg-red-600/20 transition-colors pointer-events-none" />
        )}

        <div>
          {/* Header & Badges */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${brandStyle.badgeBg} ${brandStyle.badgeText} ${brandStyle.badgeBorder}`}>
              {tool.category || brandStyle.brandTag}
            </span>
            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isComingSoon 
                ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30" 
                : "text-white bg-red-950/80 border border-red-500/50"
            }`}>
              {isComingSoon ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: "6s" }} />
                  <span>COMING SOON</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>{tool.version}</span>
                </>
              )}
            </div>
          </div>

          {/* Banner Image / Thumbnail */}
          <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden mb-5 border border-white/10 group-hover:border-yellow-400/50 transition-colors shadow-lg">
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
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/85 border border-yellow-400/60 text-yellow-400 text-xs font-black tracking-widest uppercase shadow-2xl">
                  <Lock className="w-4 h-4 text-yellow-400" />
                  <span>Coming Soon</span>
                </span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <span className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                <span>{tool.systemRequirements.os}</span>
              </span>
              <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 text-yellow-400 font-mono text-[11px] font-bold">
                {tool.fileSize}
              </span>
            </div>
          </div>

          {/* Title & Tagline with Distinctive Masked Gradient Colors */}
          <h3 className="text-xl font-black mb-2 transition-transform duration-300">
            <span className={toolTitleClass}>
              {tool.name}
            </span>
          </h3>
          <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed font-normal">
            {tool.tagline}
          </p>

          {/* Top Features */}
          <ul className="space-y-1.5 mb-6 text-xs text-slate-200">
            {tool.features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isComingSoon ? "text-slate-500" : "text-yellow-400"}`} />
                <span className="truncate">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-4 border-t border-white/10 mt-auto">
          {isComingSoon ? (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-400 font-medium">Release Status</span>
                <span className="text-yellow-400 font-bold font-mono">In Active Development ⏳</span>
              </div>
              <div className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed select-none ${brandStyle.badgeBg} ${brandStyle.badgeText} ${brandStyle.badgeBorder}`}>
                <Lock className="w-4 h-4" />
                <span>Coming Soon (শীঘ্রই আসছে)</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Offer Price Starting From</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-yellow-400">
                      ${lowestPriceUSD}
                    </span>
                    <span className="text-xs text-white font-bold">/ 7 Days 🔥</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (৳{lowestPriceBDT})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] text-white font-bold bg-red-950 px-2 py-1 rounded border border-red-500/50">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span>bKash &bull; Rocket</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all text-center"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href={`/tools/${tool.slug}#plans`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-md hover:shadow-neon-yellow transition-all text-center"
                >
                  <span>Get License</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
