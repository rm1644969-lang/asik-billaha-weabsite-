"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolCard from "@/components/ToolCard";
import Card3D from "@/components/Card3D";
import CyberCanvas3D from "@/components/CyberCanvas3D";
import { useNexusStore } from "@/lib/store";
import { sampleTools } from "@/lib/mockData";
import { Search, Layers, Sparkles, Check, Zap } from "lucide-react";

export default function ToolsMarketplacePage() {
  const { tools, plans, settings } = useNexusStore();
  const [searchQuery, setSearchQuery] = useState("");

  const allTools = tools && tools.length >= 3 ? tools : sampleTools;
  const filteredTools = allTools.filter((tool) => {
    return (
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 overflow-hidden">
      
      {/* 3D Ambient Cyber Canvas in Background */}
      <CyberCanvas3D className="absolute -top-10 left-0 right-0 h-[480px] pointer-events-none opacity-50 z-0" />

      <div className="relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>Toolsbd.com Official Release</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gradient-gold-fire">
          Software Tool &amp; Offer Price List
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          Select your plan — 7 Days ($2), 15 Days ($4), or 30 Days ($8) — pay with bKash or Rocket, and receive your HWID license key instantly.
        </p>
      </div>

      {/* Search Bar (only shown when > 1 tool) */}
      {tools.length > 1 && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-center justify-between border border-white/10">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tools by name, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
            />
          </div>
        </div>
      )}

      {/* Tools Grid (Flagship + Coming Soon Tools) */}
      {filteredTools.length > 0 ? (
        <div className="space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {/* Special TOOLS OFFER PRICE List */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-yellow-400 via-red-500/70 to-yellow-600/40 shadow-neon-yellow">
            <div className="rounded-2xl bg-[#0b0b0b]/95 backdrop-blur-xl p-6 sm:p-8 space-y-6 border border-white/10">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Special Offer</span>
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    TOOLS OFFER PRICE 🔊
                  </h2>
                </div>
                <div className="text-left sm:text-right text-xs font-mono text-slate-300">
                  <span className="block text-yellow-400 font-black">Instant HWID Key</span>
                  <span>bKash &bull; Rocket Auto</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.filter(p => p.enabled).map((plan) => (
                  <Card3D key={plan.id} maxTilt={7} depth={1.03} glare={true} className="h-full">
                    <div
                      className="relative rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 bg-[#121212] border-white/10 hover:border-yellow-400/50 h-full"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base sm:text-lg font-black text-white">
                            {plan.durationDays} DAYS OFFER 🔥
                          </span>
                          {plan.originalPriceUSD && (
                            <span className="text-xs text-slate-500 line-through font-mono">
                              ${plan.originalPriceUSD}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-baseline gap-1.5 pt-1">
                          <span className="text-3xl font-black text-yellow-400 leading-none">
                            ${plan.priceUSD}
                          </span>
                          <span className="text-xs font-black text-white">USD 🔥</span>
                          <span className="text-xs font-mono text-slate-400 ml-1">
                            (৳{plan.priceBDT})
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-2 text-[11px] text-slate-300">
                          {plan.features.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-yellow-400 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10">
                        <Link
                          href={`/checkout?tool=tool-otp-utility&plan=${plan.id}`}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                            plan.isPopular
                              ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black shadow-neon-yellow hover:opacity-95"
                              : "bg-white/10 hover:bg-white/20 text-white"
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Buy Now</span>
                        </Link>
                      </div>
                    </div>
                  </Card3D>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-4">
                  <span>
                    bKash Personal: <strong className="text-yellow-400">{settings.bkashMerchantNumber}</strong>
                  </span>
                  <span>
                    Rocket Personal: <strong className="text-red-400">{settings.rocketMerchantNumber}</strong>
                  </span>
                </div>
                <Link href="/dashboard" className="text-yellow-400 hover:underline font-sans font-bold">
                  Or Buy with Wallet &rarr;
                </Link>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl glass-panel border border-white/10 space-y-3">
          <Layers className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No tools found</h3>
          <p className="text-sm text-slate-400">
            Try adjusting your search query.
          </p>
        </div>
      )}

      </div>
    </div>
  );
}
