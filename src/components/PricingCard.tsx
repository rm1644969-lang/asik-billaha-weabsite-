"use client";

import React from "react";
import Link from "next/link";
import { PricePlan } from "@/lib/types";
import { Check, Zap, Sparkles, ShieldCheck } from "lucide-react";
import Card3D from "@/components/Card3D";

interface PricingCardProps {
  plan: PricePlan;
  toolSlug?: string;
}

export default function PricingCard({ plan, toolSlug }: PricingCardProps) {
  const discountPercent = plan.originalPriceBDT
    ? Math.round(((plan.originalPriceBDT - plan.priceBDT) / plan.originalPriceBDT) * 100)
    : 0;

  const checkoutUrl = `/checkout?tool=${plan.toolId}&plan=${plan.id}`;

  return (
    <Card3D maxTilt={7} depth={1.03} glare={true} className="h-full">
      <div
        className="relative rounded-3xl p-[1px] transition-all duration-300 bg-gradient-to-b from-white/20 via-white/5 to-transparent hover:from-yellow-400/50 hover:to-white/10 h-full"
      >
      <div className="relative rounded-3xl bg-[#0a0a0a]/95 backdrop-blur-xl p-7 h-full flex flex-col justify-between overflow-hidden border border-white/10">
        <div>
          {/* Header */}
          <div className="mb-4">
            <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">
              {plan.durationDays} Days Access
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              {plan.name}
            </h3>
            {plan.toolName && (
              <p className="text-xs text-slate-400 mt-0.5">{plan.toolName}</p>
            )}
          </div>

          {/* Price */}
          <div className="mb-6 pb-6 border-b border-white/10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-yellow-400 tracking-tight drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                ${plan.priceUSD}
              </span>
              <span className="text-white text-sm font-black uppercase">USD 🔥</span>
              {plan.originalPriceUSD && (
                <span className="text-sm text-slate-500 line-through ml-1">
                  ${plan.originalPriceUSD}
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-slate-300 mt-1.5">
              bKash / Rocket Equivalent: <strong className="text-white">৳{plan.priceBDT} BDT</strong>
            </p>
            {discountPercent > 0 && (
              <span className="inline-block mt-2 text-[11px] font-black text-white bg-red-600/90 border border-red-500 px-2.5 py-0.5 rounded">
                Save {discountPercent}% Offer Price
              </span>
            )}
          </div>

          {/* Feature List */}
          <div className="space-y-3 mb-8">
            <p className="text-xs font-black uppercase tracking-wider text-slate-300">
              Included in this license:
            </p>
            <ul className="space-y-2.5 text-xs text-slate-200">
              {plan.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="p-0.5 rounded-full bg-yellow-400/20 text-yellow-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div>
          <Link
            href={checkoutUrl}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all text-center shadow-lg bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black shadow-neon-yellow hover:opacity-95"
          >
            <Zap className="w-4 h-4 text-black" />
            <span>Select & Buy Plan</span>
          </Link>
          <p className="text-center text-[10px] text-slate-400 mt-2.5 flex items-center justify-center gap-1 font-semibold">
            <ShieldCheck className="w-3 h-3 text-red-500" />
            <span>Auto Delivery via bKash / Rocket</span>
          </p>
        </div>
      </div>
      </div>
    </Card3D>
  );
}
