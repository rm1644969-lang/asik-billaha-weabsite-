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
  CheckCircle2
} from "lucide-react";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const lowestPriceUSD = tool.plans && tool.plans.length > 0 
    ? Math.min(...tool.plans.map(p => p.priceUSD))
    : 2;
  const lowestPriceBDT = tool.plans && tool.plans.length > 0 
    ? Math.min(...tool.plans.map(p => p.priceBDT))
    : 240;

  return (
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-yellow-500/20 to-red-600/30 hover:from-yellow-400 hover:via-red-500 hover:to-transparent transition-all duration-500 shadow-xl hover:shadow-neon-yellow">
      
      {/* Background card with glass effect */}
      <div className="relative rounded-2xl bg-[#0c0c0c]/95 backdrop-blur-xl p-6 h-full flex flex-col justify-between overflow-hidden border border-white/10">
        
        {/* Glow ambient circle on card hover */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl group-hover:bg-red-600/20 transition-colors pointer-events-none" />

        <div>
          {/* Header & Badges */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
              {tool.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-white font-bold bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-500/50">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>{tool.version}</span>
            </div>
          </div>

          {/* Banner Image / Thumbnail */}
          <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden mb-5 border border-white/10 group-hover:border-yellow-400/50 transition-colors shadow-lg">
            <Image
              src={tool.bannerUrl}
              alt={tool.name}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent opacity-80" />
            
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

          {/* Title & Tagline */}
          <h3 className="text-xl font-black text-white group-hover:text-yellow-400 transition-colors mb-2">
            {tool.name}
          </h3>
          <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed font-normal">
            {tool.tagline}
          </p>

          {/* Top Features */}
          <ul className="space-y-1.5 mb-6 text-xs text-slate-200">
            {tool.features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span className="truncate">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-4 border-t border-white/10 mt-auto">
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
        </div>

      </div>
    </div>
  );
}
