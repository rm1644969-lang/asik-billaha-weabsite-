"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store";
import { ChevronDown, Sparkles, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function FaqPage() {
  const { faqs, settings } = useNexusStore();
  const [openId, setOpenId] = useState<string | null>("faq-1");

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Support & Clarification</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Clear answers about automated bKash/Nagad verification, HWID license binding, and troubleshooting.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-2xl glass-panel border border-white/10 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {faq.category}
                  </span>
                  <span className="text-base font-bold text-white">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-cyan-400 transition-transform duration-300 shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-300 leading-relaxed border-t border-white/5">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still need help CTA */}
      <div className="rounded-3xl p-8 bg-surface-card border border-white/10 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Have a specific question?</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Our Telegram support channel is active 24/7 to assist with payment inquiries or HWID resets.
        </p>
        <a
          href={settings.telegramGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold shadow-neon-purple hover:opacity-95 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Ask on Telegram</span>
        </a>
      </div>

    </div>
  );
}
