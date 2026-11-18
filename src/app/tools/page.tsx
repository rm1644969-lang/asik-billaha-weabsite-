"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolCard from "@/components/ToolCard";
import { useNexusStore } from "@/lib/store";
import { Search, Layers, Sparkles, Check, Zap } from "lucide-react";

export default function ToolsMarketplacePage() {
  const { tools, plans, settings } = useNexusStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = tools.filter((tool) => {
    return (
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>Toolsbd.com Official Release</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white">
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

      {/* Side-by-Side Layout: Tool on Left + Price List on Right */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Tool Card */}
          <div className="lg:col-span-5 flex flex-col">
            <ToolCard tool={filteredTools[0]} />
          </div>

          {/* Right: TOOLS OFFER PRICE List */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-yellow-400 via-red-500/70 to-yellow-600/40 shadow-neon-yellow h-full">
              <div className="rounded-2xl bg-[#0b0b0b]/95 backdrop-blur-xl p-6 sm:p-7 h-full flex flex-col justify-between space-y-6 border border-white/10">
                
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
  );
}
