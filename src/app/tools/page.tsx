"use client";

import React, { useState } from "react";
import ToolCard from "@/components/ToolCard";
import PricingCard from "@/components/PricingCard";
import { useNexusStore } from "@/lib/store";
import { Search, Layers, Sparkles } from "lucide-react";

export default function ToolsMarketplacePage() {
  const { tools, plans } = useNexusStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = tools.filter((tool) => {
    return (
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-14">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>Toolsbd.com Official Release</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white">
          Software Tool Marketplace
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

      {/* Tools Grid / Centered Flagship */}
      {filteredTools.length > 0 ? (
        <div className={filteredTools.length === 1 ? "max-w-lg mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
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

      {/* TOOLS OFFER PRICE Section */}
      <div className="space-y-8 pt-10 border-t border-white/10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            TOOLS OFFER PRICE 🔊
          </h2>
          <p className="text-sm text-slate-300 font-semibold">
            7 DAYS — <span className="text-yellow-400 font-black">$2 🔥</span> &bull; 15 DAYS — <span className="text-yellow-400 font-black">$4 🔥</span> &bull; 30 DAYS — <span className="text-yellow-400 font-black">$8 🔥</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.filter(p => p.enabled).map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>

    </div>
  );
}
